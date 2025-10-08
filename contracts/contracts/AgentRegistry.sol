// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AgentRegistryRentable
 * @notice Registro de agentes que permite alquilar por tiempo (precio por segundo + tarifa base).
 * - Los agentes se registran con metadata en IPFS.
 * - Cada agente tiene un owner (dueño) que recibe los pagos por alquiler.
 * - Los pagos se acumulan en saldo y el owner los retira (pull pattern).
 *
 * Nota importante: el contrato **no** entrega llaves ni URLs; solo deja un registro on-chain
 * que debe ser consultado por el servicio off-chain para autorizar el uso.
 */
contract AgentRegistryRentable is ReentrancyGuard {

    struct Agent {
        uint256 id;
        address owner;
        string ipfsHash;
        uint256 score;           // reputación (promedio o valor arbitrario)
        uint256 pricePerSecond;  // precio por segundo (en wei)
        uint256 basePrice;       // tarifa fija por uso (en wei)
        bool available;          // si está disponible para alquiler
        uint256 createdAt;
    }

    struct Rental {
        address renter;
        uint256 startAt;   // timestamp
        uint256 endAt;     // timestamp (startAt + duración)
        uint256 pricePaid; // total pagado por esta renta (wei)
    }

    uint256 private nextId = 1;
    mapping(uint256 => Agent) public agents;      // id => Agent
    mapping(uint256 => Rental) public rentals;    // id => current Rental (si endAt > block.timestamp => activo)
    mapping(address => uint256) public balances;  // pull payments: owner => balance (wei)

    // Events
    event AgentRegistered(uint256 indexed id, address indexed owner, string ipfsHash, uint256 pricePerSecond, uint256 basePrice);
    event AgentPriceUpdated(uint256 indexed id, uint256 oldPricePerSecond, uint256 newPricePerSecond);
    event AgentBasePriceUpdated(uint256 indexed id, uint256 oldBasePrice, uint256 newBasePrice);
    event AgentAvailabilityUpdated(uint256 indexed id, bool available);
    event AgentRented(uint256 indexed id, address indexed renter, uint256 startAt, uint256 endAt, uint256 pricePaid);
    event RentalExtended(uint256 indexed id, address indexed renter, uint256 oldEndAt, uint256 newEndAt, uint256 extraPaid);
    event RentalEnded(uint256 indexed id, address indexed renter, uint256 endAt);
    event EarningsWithdrawn(address indexed owner, uint256 amount);

    // ---------- Modifiers ----------
    modifier onlyAgentOwner(uint256 id) {
        require(agents[id].owner == msg.sender, "Not agent owner");
        _;
    }

    modifier agentExists(uint256 id) {
        require(id > 0 && id < nextId, "Agent does not exist");
        _;
    }

    // ---------- Registration ----------
    /**
     * @notice Registra un agente con un precio por segundo y una tarifa base.
     * @param ipfsHash CID en IPFS que apunta al metadata del agente.
     * @param pricePerSecond precio por segundo en wei (1 AVAX = 1e18 wei).
     * @param basePrice tarifa fija de uso en wei (puede ser 0).
     */
    function registerAgent(
        string calldata ipfsHash,
        uint256 pricePerSecond,
        uint256 basePrice
    ) external {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(pricePerSecond > 0, "pricePerSecond must be > 0");
        // basePrice can be 0 (no tarifa fija)
        require(basePrice >= 0, "basePrice invalid");

        uint256 id = nextId++;
        agents[id] = Agent({
            id: id,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            score: 0,
            pricePerSecond: pricePerSecond,
            basePrice: basePrice,
            available: true,
            createdAt: block.timestamp
        });

        emit AgentRegistered(id, msg.sender, ipfsHash, pricePerSecond, basePrice);
    }

    // ---------- View helpers ----------
    /**
     * @notice Indica si el agente está actualmente alquilado.
     */
    function isRented(uint256 id) public view agentExists(id) returns (bool) {
        return rentals[id].endAt > block.timestamp;
    }

    /**
     * @notice Devuelve tiempo restante en segundos si está alquilado, 0 si no.
     */
    function rentalTimeRemaining(uint256 id) public view agentExists(id) returns (uint256) {
        if (!isRented(id)) return 0;
        return rentals[id].endAt - block.timestamp;
    }

    // ---------- Owner actions ----------
    /**
     * @notice Cambia el precio por segundo del agente.
     */
    function setPrice(uint256 id, uint256 newPricePerSecond) external agentExists(id) onlyAgentOwner(id) {
        require(newPricePerSecond > 0, "Price must be > 0");
        uint256 old = agents[id].pricePerSecond;
        agents[id].pricePerSecond = newPricePerSecond;
        emit AgentPriceUpdated(id, old, newPricePerSecond);
    }

    /**
     * @notice Cambia la tarifa base del agente.
     */
    function setBasePrice(uint256 id, uint256 newBasePrice) external agentExists(id) onlyAgentOwner(id) {
        // newBasePrice can be zero
        uint256 old = agents[id].basePrice;
        agents[id].basePrice = newBasePrice;
        emit AgentBasePriceUpdated(id, old, newBasePrice);
    }

    /**
     * @notice Habilita o inhabilita el agente para alquiler.
     */
    function setAvailability(uint256 id, bool available) external agentExists(id) onlyAgentOwner(id) {
        agents[id].available = available;
        emit AgentAvailabilityUpdated(id, available);
    }

    // ---------- Renting ----------
    /**
     * @notice Alquila un agente por una duración (segundos). Pagos en wei.
     * Total = basePrice + pricePerSecond * durationSeconds
     * @param id id del agente
     * @param durationSeconds duración en segundos que se desea alquilar
     */
    function rentAgent(uint256 id, uint256 durationSeconds) external payable nonReentrant agentExists(id) {
        Agent storage a = agents[id];
        require(a.available, "Agent not available");
        require(durationSeconds > 0, "Duration must be > 0");

        uint256 costPerTime = a.pricePerSecond * durationSeconds;
        uint256 cost = a.basePrice + costPerTime;
        require(msg.value >= cost, "Insufficient payment");

        // Si ya está rentado y no expiró: no permitir solapamiento por otro renter
        if (isRented(id)) {
            // permitir _extensión_ sólo por el mismo renter via extendRental
            revert("Agent is currently rented");
        }

        uint256 startAt = block.timestamp;
        uint256 endAt = startAt + durationSeconds;

        rentals[id] = Rental({
            renter: msg.sender,
            startAt: startAt,
            endAt: endAt,
            pricePaid: cost
        });

        // Accumular fondos al owner (pull pattern)
        balances[a.owner] += cost;

        // Reembolsar exceso si pagaron de más
        if (msg.value > cost) {
            uint256 change = msg.value - cost;
            (bool sent, ) = payable(msg.sender).call{value: change}("");
            // si falla el reembolso, revertimos para no dejar fondos atrapados por error del transfer
            require(sent, "Refund failed");
        }

        emit AgentRented(id, msg.sender, startAt, endAt, cost);
    }

    /**
     * @notice Extiende la renta actual (solo el renter actual puede hacerlo antes de expiración).
     * Nota: la extensión NO cobra de nuevo basePrice, solo precio por segundo.
     * @param id id del agente
     * @param extraSeconds segundos adicionales a sumar
     */
    function extendRental(uint256 id, uint256 extraSeconds) external payable nonReentrant agentExists(id) {
        require(isRented(id), "Agent not rented");
        Rental storage r = rentals[id];
        require(r.renter == msg.sender, "Only renter can extend");
        require(extraSeconds > 0, "extraSeconds > 0");

        Agent storage a = agents[id];
        uint256 extraCost = a.pricePerSecond * extraSeconds;
        require(msg.value >= extraCost, "Insufficient payment for extension");

        uint256 oldEnd = r.endAt;
        r.endAt = r.endAt + extraSeconds;
        r.pricePaid = r.pricePaid + extraCost;

        // Accumulate to owner's balance
        balances[a.owner] += extraCost;

        // refund overpay if any
        if (msg.value > extraCost) {
            uint256 change = msg.value - extraCost;
            (bool sent, ) = payable(msg.sender).call{value: change}("");
            require(sent, "Refund failed");
        }

        emit RentalExtended(id, msg.sender, oldEnd, r.endAt, extraCost);
    }

    /**
     * @notice Finaliza manualmente una renta si ya expiró (cualquiera puede llamarlo).
     * Esto emite evento y borra el rental (opcional: no borrar para historial).
     */
    function finalizeRental(uint256 id) external agentExists(id) {
        require(isRented(id) == false, "Rental still active");
        Rental storage r = rentals[id];
        if (r.renter != address(0)) {
            // emitimos evento de fin si existía renta previa
            emit RentalEnded(id, r.renter, r.endAt);
            // borrar registro (opcional)
            delete rentals[id];
        }
    }

    // ---------- Withdrawals ----------
    /**
     * @notice Owner del agente retira sus ganancias acumuladas.
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");
        balances[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit EarningsWithdrawn(msg.sender, amount);
    }

    // ---------- Helpers y getters ----------
    function getAgent(uint256 id) external view agentExists(id) returns (Agent memory) {
        return agents[id];
    }

    function getRental(uint256 id) external view agentExists(id) returns (Rental memory) {
        return rentals[id];
    }

    function getAgents() external view returns (Agent[] memory) {
        Agent[] memory list = new Agent[](nextId - 1);
        for (uint256 i = 1; i < nextId; i++) {
            list[i - 1] = agents[i];
        }
        return list;
    }
}