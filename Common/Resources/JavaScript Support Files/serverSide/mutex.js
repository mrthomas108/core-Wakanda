/**
 *
 * 
 *
 * @class Mutex
 * @extends Object
 *
 */
Mutex = function Mutex() {
    
    
    
    /**
     * tries to lock the Mutex or returns false if it is already locked
     *
     * @method tryToLock
     * @return {Boolean}
     */
    this.tryToLock = function tryToLock() {
    
    /**
     * unlocks the Mutex in the current thread and returns true
     *
     * @method unlock
     * @return {Boolean}
     */
    this.unlock = function unlock() {
    
    /**
     * locks the Mutex or wait until it has been released
     *
     * @method lock
     * @return {Boolean}
     */
    this.lock = function lock() {
    

};
