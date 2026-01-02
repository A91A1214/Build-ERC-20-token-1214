import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet, getProvider, getSigner } from './utils/wallet';
import { TOKEN_ABI, FAUCET_ABI, TOKEN_ADDRESS, FAUCET_ADDRESS } from './utils/contracts';
import './utils/eval';
import './App.css';

function App() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [canClaim, setCanClaim] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (address) {
      updateState();
      const interval = setInterval(updateState, 10000); // Update every 10s
      return () => clearInterval(interval);
    }
  }, [address]);

  const updateState = async () => {
    try {
      const provider = getProvider();
      if (!provider || !address) return;

      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);

      const [bal, remAllowance, claimable, lastClaim] = await Promise.all([
        token.balanceOf(address),
        faucet.remainingAllowance(address),
        faucet.canClaim(address),
        faucet.lastClaimAt(address)
      ]);

      setBalance(ethers.formatEther(bal));
      setAllowance(ethers.formatEther(remAllowance));
      setCanClaim(claimable);

      // Calculate cooldown
      const cooldownTime = Number(await faucet.COOLDOWN_TIME());
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(lastClaim) + cooldownTime - now;
      setCooldown(remaining > 0 ? remaining : 0);
    } catch (err) {
      console.error("State update failed:", err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Please connect wallet");

      const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
      const tx = await faucet.requestTokens();
      setSuccess(`Transaction submitted: ${tx.hash.substring(0, 10)}...`);
      await tx.wait();
      setSuccess('Tokens claimed successfully!');
      updateState();
    } catch (err) {
      setError(err.reason || err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const formatCooldown = (seconds) => {
    if (seconds <= 0) return "Ready to claim!";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s remaining`;
  };

  return (
    <div className="container">
      <header>
        <h1>ERC-20 Token Faucet</h1>
        <div className="wallet-info">
          {address ? (
            <span className="address">Connected: {address.substring(0, 6)}...{address.substring(38)}</span>
          ) : (
            <button onClick={handleConnect} disabled={loading} className="connect-btn">
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      <main>
        {address && (
          <div className="dashboard">
            <div className="card">
              <h3>Your Balance</h3>
              <p className="value">{Number(balance).toFixed(4)} TOK</p>
            </div>

            <div className="card">
              <h3>Lifetime Allowance</h3>
              <p className="value">{Number(allowance).toFixed(4)} TOK remaining</p>
            </div>

            <div className="card">
              <h3>Status</h3>
              <p className={`status ${canClaim ? 'ready' : 'waiting'}`}>
                {formatCooldown(cooldown)}
              </p>
            </div>

            <button
              onClick={handleClaim}
              disabled={loading || !canClaim}
              className="claim-btn"
            >
              {loading ? 'Processing...' : 'Request 100 Tokens'}
            </button>
          </div>
        )}

        {!address && (
          <div className="welcome">
            <p>Connect your wallet to start claiming tokens from the faucet.</p>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
      </main>

      <footer>
        <p>Token: {TOKEN_ADDRESS.substring(0, 10)}...</p>
        <p>Faucet: {FAUCET_ADDRESS.substring(0, 10)}...</p>
      </footer>
    </div>
  );
}

export default App;
