pragma solidity ^0.4.11;


contract SafeMath {

    // ensure that the result of adding x and y is accurate 
    function add(uint x, uint y) internal constant returns (uint z) {
        assert((z = x + y) >= x);
    }
 
    // ensure that the result of subtracting y from x is accurate 
    function subtract(uint x, uint y) internal constant returns (uint z) {
        assert((z = x - y) <= x);
    }

    // ensure that the result of multiplying x and y is accurate 
    function multiply(uint x, uint y) internal constant returns (uint z) {
        z = x * y;
        assert(x == 0 || z / x == y);
        return z;
    }

    // ensure that the result of dividing x and y is accurate
    // note: Solidity now throws on division by zero, so a check is not needed
    function divide(uint x, uint y) internal constant returns (uint z) {
        z = x / y;
        assert(x == ( (y * z) + (x % y) ));
        return z;
    }
    
    // return the lowest of two 64 bit integers
    function min64(uint64 x, uint64 y) internal constant returns (uint64) {
        return x < y ? x: y;
    }
    
    // return the largest of two 64 bit integers
    function max64(uint64 x, uint64 y) internal constant returns (uint64) {
        return x >= y ? x : y;
    }

    // return the lowest of two values
    function min(uint x, uint y) internal constant returns (uint) {
        return (x <= y) ? x : y;
    }

    // return the largest of two values
    function max(uint x, uint y) internal constant returns (uint) {
        return (x >= y) ? x : y;
    }

    function assert(bool assertion) internal {
        if (!assertion) {
            revert();
        }
    }
}