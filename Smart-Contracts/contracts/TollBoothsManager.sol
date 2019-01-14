pragma solidity ^0.4.23;

import "./SafeMath.sol";
import "./Ownable.sol";

//
contract TollBoothsManager is Ownable {
	using SafeMath for uint;

    struct TicketTB {
        string name;
        string vehicles;
        uint price;
        uint version;
        uint tollBoothId;
        address paymentAddress;
    }
    struct RepairTB {
        string time;
        string description;
        uint costs;
    }
    
    struct TollBooth {
        string name;
        string location;
        string description;
        uint256 investment;//first investment
        uint256 totalInvestment;
        uint256 totalRevenue;
        string startTime;
        string operatorUnit;
        bool activate;
    }
    struct TollBoothAdditional {
        uint8 numTickets;
        uint numAdditionalRepairs;
        uint taxCode;
        bool completeTarget;
        mapping(uint8 => TicketTB) tickets;
        mapping(uint => RepairTB) additionalRepairs;
    }
    //
    mapping(uint => TollBooth) public tollBooths;
    mapping(uint => TollBoothAdditional) public tollBoothsAdditional;
    uint public totalTollBooths;
    uint8 public maxTicket;
    //
    struct buyTicket{
		address buyer;
        address paymentAddress;
		uint8 ticketId;
		uint tollBoothId;
        uint price;
		uint clientTime;
		uint time;
	}
	mapping(uint => buyTicket) public buyTickets;
	uint public currentBuyTickets;
    //
    event CreateTicket(uint indexed tollBoothId, uint8 ticketId, string name, string vehicles, uint price, uint version, address paymentAddress, uint time);
    event TicketUpdate(uint indexed tollBoothId, uint8 ticketId, string name, string vehicles, uint price, uint version, address paymentAddress, uint time);
    event userBuyTicket(address indexed buyer, uint indexed tollBoothId, uint8 ticketId, uint price, address paymentAddress, uint time);
    //
    constructor () public {
        maxTicket = 10;
        totalTollBooths = 0;
    }
    //@
    function createNewTollBooth(
        string _name, 
        string _location,
        string _description,
        uint256 _investment,
        string _startTime,
        string _operatorUnit,
        uint256 _taxCode,
        bool _activate) public onlyOwner {
            tollBooths[totalTollBooths] = TollBooth({
                name: _name,
                location: _location,
                description: _description,
                investment: _investment,
                totalInvestment: _investment,
                totalRevenue: 0,
                startTime: _startTime,
                operatorUnit: _operatorUnit,
                activate: _activate
            });
            tollBoothsAdditional[totalTollBooths] = TollBoothAdditional({
                numTickets: 0,
                numAdditionalRepairs: 0,
                taxCode: _taxCode,
                completeTarget: false
            });
            totalTollBooths++;
        }
    //@
    function updateTollBooth(
        uint _id,
        string _name, 
        string _location,
        string _description,
        uint256 _investment,
        string _startTime,
        string _operatorUnit,
        uint256 _taxCode,
        bool _activate) public onlyOwner {
            if(_id >= totalTollBooths)revert();
            tollBooths[_id].name = _name;
            tollBooths[_id].location = _location;
            tollBooths[_id].description = _description;
            tollBooths[_id].investment = _investment;
            tollBooths[_id].startTime = _startTime;
            tollBooths[_id].operatorUnit = _operatorUnit;
            tollBooths[_id].activate = _activate;
            //
            tollBoothsAdditional[_id].taxCode = _taxCode;
            updateTotalInvestment(_id);
        }

    //@
    function updateTotalInvestment(uint _id) private {
        tollBooths[_id].totalInvestment = tollBooths[_id].investment;
        uint numRepairs = tollBoothsAdditional[_id].numAdditionalRepairs;
        for (uint i = 0; i < numRepairs; i++){
            uint costs = tollBoothsAdditional[_id].additionalRepairs[i].costs;
            tollBooths[_id].totalInvestment = tollBooths[_id].totalInvestment.add(costs);
        }
        checkCompleteTarget(_id);
    }
    //@
    function checkCompleteTarget(uint _id) private {
        tollBoothsAdditional[_id].completeTarget = false;
        if(tollBooths[_id].totalRevenue >= tollBooths[_id].totalInvestment){
            tollBoothsAdditional[_id].completeTarget = true;
        }
    }


    //@
    function createTicketTB(
        string _name, 
        string _vehicles, 
        uint _price, 
        uint _tbid, 
        address _paymentAddress) public onlyOwner {
            if(_tbid >= totalTollBooths)revert();
            require(tollBoothsAdditional[_tbid].numTickets < maxTicket);
            uint8 _id = tollBoothsAdditional[_tbid].numTickets;
            tollBoothsAdditional[_tbid].tickets[_id] = TicketTB({
                name: _name,
                vehicles: _vehicles,
                price: _price,
                version: 1,
                tollBoothId: _tbid,
                paymentAddress: _paymentAddress
            });
            tollBoothsAdditional[_tbid].numTickets++;
            emit CreateTicket(_tbid, _id, _name, _vehicles, _price, 1, _paymentAddress, now);
    }

    //@
    function updateTicketTB(
        string _name, 
        string _vehicles, 
        uint _price, 
        uint _tbid, 
        uint8 _id, 
        address _paymentAddress) public onlyOwner {
            if(_tbid >= totalTollBooths)revert();
            require(_id < tollBoothsAdditional[_tbid].numTickets);
            //
            tollBoothsAdditional[_tbid].tickets[_id].name = _name;
            tollBoothsAdditional[_tbid].tickets[_id].vehicles = _vehicles;
            tollBoothsAdditional[_tbid].tickets[_id].price = _price;
            tollBoothsAdditional[_tbid].tickets[_id].paymentAddress = _paymentAddress;
            tollBoothsAdditional[_tbid].tickets[_id].version++;
            uint _version = tollBoothsAdditional[_tbid].tickets[_id].version;
            emit TicketUpdate(_tbid, _id, _name, _vehicles, _price, _version, _paymentAddress, now);
    }

    //@
    function getTicketDetails(uint _tbid, uint8 _id) public view returns(string, string, uint, uint, address) {
        if(_tbid >= totalTollBooths)revert();
        require(_id < tollBoothsAdditional[_tbid].numTickets);
        TicketTB ticket = tollBoothsAdditional[_tbid].tickets[_id];
        return(ticket.name, ticket.vehicles, ticket.price, ticket.version, ticket.paymentAddress);
    }

    //@
    function addRepairTB(
        string _time, 
        string _description, 
        uint _costs, 
        uint _tbid) public onlyOwner {
            if(_tbid >= totalTollBooths)revert();
            uint _id = tollBoothsAdditional[_tbid].numAdditionalRepairs;
            tollBoothsAdditional[_tbid].additionalRepairs[_id] = RepairTB({
                time: _time,
                description: _description,
                costs: _costs
            });
            tollBoothsAdditional[_tbid].numAdditionalRepairs++;
            updateTotalInvestment(_tbid);
    }

    //@
    function updateRepairTB(
        string _time, 
        string _description, 
        uint _costs, 
        uint _tbid, 
        uint _id) public onlyOwner {
            if(_tbid >= totalTollBooths)revert();
            require(_id < tollBoothsAdditional[_tbid].numAdditionalRepairs);
            //
            tollBoothsAdditional[_tbid].additionalRepairs[_id].time = _time;
            tollBoothsAdditional[_tbid].additionalRepairs[_id].description = _description;
            tollBoothsAdditional[_tbid].additionalRepairs[_id].costs = _costs;
            updateTotalInvestment(_tbid);
    }

    //@
    function getRepairDetails(uint _tbid, uint _id) public view returns(string, string, uint) {
        if(_tbid >= totalTollBooths)revert();
        require(_id < tollBoothsAdditional[_tbid].numAdditionalRepairs);
        RepairTB repair = tollBoothsAdditional[_tbid].additionalRepairs[_id];
        return(repair.time, repair.description, repair.costs);
    }

    //---------------------
    //@
    function buyTicketTB(uint _tbid, uint8 _id, uint _clientTime) public payable {
        if(_tbid >= totalTollBooths)revert();
        require(_id < tollBoothsAdditional[_tbid].numTickets);
        uint _price = tollBoothsAdditional[_tbid].tickets[_id].price;
        require(msg.value >= _price);
        address _paymentAddress = tollBoothsAdditional[_tbid].tickets[_id].paymentAddress;
        //_paymentAddress.transfer(_price);
        tollBooths[_tbid].totalRevenue = tollBooths[_tbid].totalRevenue.add(msg.value);
        buyTickets[currentBuyTickets] = buyTicket({
            buyer: msg.sender,
            paymentAddress: _paymentAddress,
            ticketId: _id,
            tollBoothId: _tbid,
            price: _price,
            clientTime: _clientTime,
            time: now
        });
        currentBuyTickets++;
        checkCompleteTarget(_tbid);
        //emit userBuyTicket(msg.sender, _tbid, _id, msg.value, paymentAddress, now);
    }
    //@
    function getBuyTicketTB(uint _tbid, uint8 _id, uint _clientTime, uint _maxQuery) public view returns(bool, uint) {
        if(_tbid >= totalTollBooths)revert();
        require(_id < tollBoothsAdditional[_tbid].numTickets);
        if(_maxQuery > currentBuyTickets)_maxQuery = currentBuyTickets;
        uint maxQuery = currentBuyTickets-_maxQuery;
        uint buyId = 0;
        bool result = false;
        for (uint i = currentBuyTickets-1; i >= maxQuery; i--){
            if(buyTickets[i].buyer == msg.sender && buyTickets[i].tollBoothId == _tbid && buyTickets[i].ticketId == _id && buyTickets[i].clientTime == _clientTime){
                    buyId = i;
                    result = true;
                    break;
            }
        }
        return(result, buyId);
    }
 
    
    //@
    /*function _validateId(bytes32 _id) internal pure returns(bytes32) {
        return _id;
    }
    //@
    function indexOf(bytes32[] memory self, bytes32 value) public view returns (bool){
        for (uint i = 0; i < self.length; i++)if (self[i] == value) return true;
        return false;
    }*/
}
