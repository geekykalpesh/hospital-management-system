import dns from 'dns';

// Ensure IPv6/IPv4 dual-stack resolution works reliably for Neon & AWS endpoints
try {
  dns.setDefaultResultOrder('verbatim');
} catch (e) {
  // fallback for older node versions
}
