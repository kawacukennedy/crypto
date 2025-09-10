// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CryptoGames
 * @dev Smart contract for gambling games (Dice, Coin Flip, Roulette) using ERC20 tokens
 */
contract CryptoGames is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    
    // Game types
    enum GameType { DICE, COINFLIP, ROULETTE }
    
    // Minimum and maximum bet amounts
    uint256 public constant MIN_BET = 1 * 10**18; // 1 token
    uint256 public constant MAX_BET = 1000 * 10**18; // 1000 tokens
    
    // House edge percentages (basis points, 100 = 1%)
    uint256 public constant HOUSE_EDGE = 200; // 2% house edge
    uint256 public constant BASIS_POINTS = 10000;
    
    // Game results storage
    struct GameResult {
        address player;
        GameType gameType;
        uint256 betAmount;
        uint256 winAmount;
        bool won;
        uint256 timestamp;
        bytes32 gameData; // Stores game-specific data
    }
    
    // Events
    event GamePlayed(
        address indexed player,
        GameType indexed gameType,
        uint256 betAmount,
        uint256 winAmount,
        bool won,
        bytes32 gameData
    );
    
    event HouseFundsDeposited(uint256 amount);
    event HouseFundsWithdrawn(uint256 amount);
    
    // House balance for payouts
    uint256 public houseBalance;
    
    // Game history
    mapping(address => GameResult[]) public playerHistory;
    uint256 public totalGamesPlayed;
    uint256 public totalWinnings;
    uint256 public totalLosses;
    
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Token address cannot be zero");
        token = IERC20(_token);
    }
    
    /**
     * @dev Deposit tokens to house balance for game payouts
     */
    function depositHouseFunds(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        houseBalance += amount;
        emit HouseFundsDeposited(amount);
    }
    
    /**
     * @dev Withdraw tokens from house balance
     */
    function withdrawHouseFunds(uint256 amount) external onlyOwner {
        require(amount <= houseBalance, "Insufficient house balance");
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        houseBalance -= amount;
        emit HouseFundsWithdrawn(amount);
    }
    
    /**
     * @dev Play dice game - predict number 1-6
     */
    function playDice(uint256 betAmount, uint8 prediction) external nonReentrant {
        require(prediction >= 1 && prediction <= 6, "Invalid prediction");
        require(betAmount >= MIN_BET && betAmount <= MAX_BET, "Invalid bet amount");
        require(token.transferFrom(msg.sender, address(this), betAmount), "Transfer failed");
        
        // Generate pseudo-random number (1-6)
        // Note: This is not cryptographically secure, use Chainlink VRF for production
        uint8 result = uint8(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            totalGamesPlayed
        ))) % 6) + 1;
        
        bool won = (result == prediction);
        uint256 winAmount = 0;
        
        if (won) {
            // Dice game: 5x payout with house edge
            winAmount = (betAmount * 500 * (BASIS_POINTS - HOUSE_EDGE)) / (100 * BASIS_POINTS);
            require(winAmount <= houseBalance, "Insufficient house balance for payout");
            require(token.transfer(msg.sender, winAmount), "Payout failed");
            houseBalance -= winAmount;
            totalWinnings += winAmount;
        } else {
            houseBalance += betAmount;
            totalLosses += betAmount;
        }
        
        // Store game data: prediction and result
        bytes32 gameData = bytes32(abi.encodePacked(prediction, result));
        
        _recordGame(GameType.DICE, betAmount, winAmount, won, gameData);
    }
    
    /**
     * @dev Play coin flip game - predict heads (0) or tails (1)
     */
    function playCoinFlip(uint256 betAmount, uint8 prediction) external nonReentrant {
        require(prediction <= 1, "Invalid prediction"); // 0 = heads, 1 = tails
        require(betAmount >= MIN_BET && betAmount <= MAX_BET, "Invalid bet amount");
        require(token.transferFrom(msg.sender, address(this), betAmount), "Transfer failed");
        
        // Generate pseudo-random result (0 or 1)
        uint8 result = uint8(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            totalGamesPlayed
        ))) % 2);
        
        bool won = (result == prediction);
        uint256 winAmount = 0;
        
        if (won) {
            // Coin flip: 2x payout with house edge
            winAmount = (betAmount * 200 * (BASIS_POINTS - HOUSE_EDGE)) / (100 * BASIS_POINTS);
            require(winAmount <= houseBalance, "Insufficient house balance for payout");
            require(token.transfer(msg.sender, winAmount), "Payout failed");
            houseBalance -= winAmount;
            totalWinnings += winAmount;
        } else {
            houseBalance += betAmount;
            totalLosses += betAmount;
        }
        
        // Store game data: prediction and result
        bytes32 gameData = bytes32(abi.encodePacked(prediction, result));
        
        _recordGame(GameType.COINFLIP, betAmount, winAmount, won, gameData);
    }
    
    /**
     * @dev Play roulette game
     * @param betAmount Amount to bet
     * @param betType 0=number, 1=red, 2=black, 3=even, 4=odd
     * @param betValue For number bets: the number (0-36), for color/parity: ignored
     */
    function playRoulette(uint256 betAmount, uint8 betType, uint8 betValue) external nonReentrant {
        require(betAmount >= MIN_BET && betAmount <= MAX_BET, "Invalid bet amount");
        require(betType <= 4, "Invalid bet type");
        if (betType == 0) { // number bet
            require(betValue <= 36, "Invalid number");
        }
        require(token.transferFrom(msg.sender, address(this), betAmount), "Transfer failed");
        
        // Generate pseudo-random number (0-36)
        uint8 result = uint8(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            totalGamesPlayed
        ))) % 37);
        
        bool won = _checkRouletteWin(betType, betValue, result);
        uint256 winAmount = 0;
        
        if (won) {
            uint256 multiplier = _getRouletteMultiplier(betType);
            winAmount = (betAmount * multiplier * (BASIS_POINTS - HOUSE_EDGE)) / BASIS_POINTS;
            require(winAmount <= houseBalance, "Insufficient house balance for payout");
            require(token.transfer(msg.sender, winAmount), "Payout failed");
            houseBalance -= winAmount;
            totalWinnings += winAmount;
        } else {
            houseBalance += betAmount;
            totalLosses += betAmount;
        }
        
        // Store game data: bet type, bet value, and result
        bytes32 gameData = bytes32(abi.encodePacked(betType, betValue, result));
        
        _recordGame(GameType.ROULETTE, betAmount, winAmount, won, gameData);
    }
    
    /**
     * @dev Check if roulette bet wins
     */
    function _checkRouletteWin(uint8 betType, uint8 betValue, uint8 result) private pure returns (bool) {
        if (betType == 0) { // number bet
            return result == betValue;
        } else if (betType == 1) { // red
            return _isRed(result);
        } else if (betType == 2) { // black
            return _isBlack(result);
        } else if (betType == 3) { // even
            return result != 0 && result % 2 == 0;
        } else if (betType == 4) { // odd
            return result != 0 && result % 2 == 1;
        }
        return false;
    }
    
    /**
     * @dev Get roulette payout multiplier
     */
    function _getRouletteMultiplier(uint8 betType) private pure returns (uint256) {
        if (betType == 0) { // number bet
            return 3600; // 36x (3600/100)
        } else { // color/parity bets
            return 200; // 2x (200/100)
        }
    }
    
    /**
     * @dev Check if roulette number is red
     */
    function _isRed(uint8 number) private pure returns (bool) {
        if (number == 0) return false;
        uint8[18] memory redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        for (uint256 i = 0; i < redNumbers.length; i++) {
            if (number == redNumbers[i]) return true;
        }
        return false;
    }
    
    /**
     * @dev Check if roulette number is black
     */
    function _isBlack(uint8 number) private pure returns (bool) {
        if (number == 0) return false;
        return !_isRed(number);
    }
    
    /**
     * @dev Record game result
     */
    function _recordGame(GameType gameType, uint256 betAmount, uint256 winAmount, bool won, bytes32 gameData) private {
        GameResult memory result = GameResult({
            player: msg.sender,
            gameType: gameType,
            betAmount: betAmount,
            winAmount: winAmount,
            won: won,
            timestamp: block.timestamp,
            gameData: gameData
        });
        
        playerHistory[msg.sender].push(result);
        totalGamesPlayed++;
        
        emit GamePlayed(msg.sender, gameType, betAmount, winAmount, won, gameData);
    }
    
    /**
     * @dev Get player's game history length
     */
    function getPlayerHistoryLength(address player) external view returns (uint256) {
        return playerHistory[player].length;
    }
    
    /**
     * @dev Get player's specific game result
     */
    function getPlayerGame(address player, uint256 index) external view returns (GameResult memory) {
        require(index < playerHistory[player].length, "Invalid index");
        return playerHistory[player][index];
    }
    
    /**
     * @dev Get contract stats
     */
    function getStats() external view returns (
        uint256 _houseBalance,
        uint256 _totalGamesPlayed,
        uint256 _totalWinnings,
        uint256 _totalLosses
    ) {
        return (houseBalance, totalGamesPlayed, totalWinnings, totalLosses);
    }
}
