// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

contract SafeMath {
   
    function safeSub(uint256 a, uint256 b) internal pure returns (uint256) {
        return safeSub(a, b, "SafeMath: subtraction overflow");
    }

    function safeSub(uint256 a, uint256 b, string memory error) internal pure returns (uint256) {
        require(b <= a, error);
        uint256 c = a - b;
        return c;
    }

    function safeAdd(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function safeMul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function safeDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        return safeDiv(a, b, "SafeMath: division by zero");
    }
    
    function safeDiv(uint256 a, uint256 b, string memory error) internal pure returns (uint256) {
        require(b > 0, error);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    function safeExponent(uint256 a,uint256 b) internal pure returns (uint256) {
        uint256 result;
        assembly {
            result:=exp(a, b)
        }
        return result;
    }
}

interface IERC20 {
    
    function totalSupply() external view returns (uint256);
    
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
   
    event Transfer(address indexed from, address indexed to, uint256 value);
   
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract AStoken is IERC20,SafeMath
{
    function tokenname() public view returns (string memory) {
        return name;
    }
    
    function tokensymbol() public view returns (string memory) {
        return symbol;
    }
    
    function totalSupply() public view override returns (uint256) {
        return totalSupply_;
    }

    function transfer(address _to, uint _tokens)public  override returns(bool success)
    {
            require(balances[msg.sender] >=_tokens && _tokens > 0);
        
            balances[msg.sender] = safeSub(balances[msg.sender],(_tokens));
            balances[_to] = safeAdd(balances[_to],(_tokens));
            emit  Transfer(msg.sender,_to,_tokens);
            return true;
    }
    
     function transferFrom(address _from,address __to, uint _token)public  override returns(bool success)
    {
            require(balances[_from] >=_token,"The spender should have enough tokens ");
            
            balances[_from] = safeSub(balances[_from],(_token));
            balances[__to] =  safeAdd(balances[__to],(_token));
            allowed[_from][msg.sender] = safeSub(allowed[_from][msg.sender],(_token));
            emit Transfer(_from,__to,_token);
            return true;
     }
    
    function balanceOf(address _Owner) public override view returns (uint256 balance) {
        return balances[_Owner];
    }

    function approve(address _spender, uint256 _value)public override returns (bool success) {
        
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _tokenOwner, address _spenderaddr) public override view returns (uint256 remaining) {
      return allowed[_tokenOwner][_spenderaddr];
     }
   
    mapping (address => uint256)internal balances;
    mapping (address => mapping(address => uint256))allowed;
    
    
    constructor( ) public {
        balances[msg.sender] = _initialAmount;                               
    }
   
    string public  name="AST";
    string public  symbol="AST" ;
    uint256 public decimals=18;
    uint256 public totalSupply_= 6000 * (uint256(10) ** decimals);
    uint256 public _initialAmount = totalSupply_ ;
    
}

