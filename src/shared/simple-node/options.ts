export const IP_VERSIONS = ['dual', 'ipv4', 'ipv6', 'ipv4-prefer', 'ipv6-prefer'] as const

export const FINGERPRINTS = [
  'chrome',
  'firefox',
  'safari',
  'iOS',
  'android',
  'edge',
  '360',
  'qq',
  'random',
  'randomized'
] as const

export const SS_CIPHERS = [
  'aes-128-gcm',
  'aes-192-gcm',
  'aes-256-gcm',
  'aes-128-cfb',
  'aes-192-cfb',
  'aes-256-cfb',
  'aes-128-ctr',
  'aes-192-ctr',
  'aes-256-ctr',
  'rc4-md5',
  'chacha20-ietf-poly1305',
  'xchacha20-ietf-poly1305',
  'chacha20-ietf',
  'chacha20',
  '2022-blake3-aes-128-gcm',
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305',
  'none'
] as const

export const VMESS_CIPHERS = ['auto', 'none', 'zero', 'aes-128-gcm', 'chacha20-poly1305'] as const

export const SSR_CIPHERS = [
  'aes-128-cfb',
  'aes-192-cfb',
  'aes-256-cfb',
  'aes-128-ctr',
  'aes-192-ctr',
  'aes-256-ctr',
  'rc4-md5',
  'chacha20-ietf',
  'xchacha20',
  'none'
] as const

export const SSR_OBFS = [
  'plain',
  'http_simple',
  'http_post',
  'random_head',
  'tls1.2_ticket_auth',
  'tls1.2_ticket_fastauth'
] as const

export const SSR_PROTOCOLS = [
  'origin',
  'auth_sha1_v4',
  'auth_aes128_md5',
  'auth_aes128_sha1',
  'auth_chain_a',
  'auth_chain_b'
] as const

const RAW_NETWORK = { value: 'tcp', label: 'tcp / raw' } as const

export const VMESS_NETWORKS = [
  RAW_NETWORK,
  'ws',
  'http',
  'h2',
  'grpc',
  'mkcp',
  'kcp',
  'mekya'
] as const

export const VLESS_NETWORKS = [RAW_NETWORK, 'ws', 'http', 'h2', 'grpc', 'xhttp'] as const

export const TROJAN_NETWORKS = [RAW_NETWORK, 'ws', 'http', 'h2', 'grpc'] as const

export const PACKET_ENCODINGS = ['packetaddr', 'packet', 'xudp'] as const

export const VLESS_FLOWS = ['', 'xtls-rprx-vision', 'xtls-rprx-origin', 'xtls-rprx-direct'] as const

export const SS_PLUGINS = [
  'obfs',
  'v2ray-plugin',
  'shadow-tls',
  'restls',
  'jls',
  'gost-plugin',
  'kcptun'
] as const

export const PLUGIN_MODES = ['http', 'tls', 'websocket', 'quic'] as const

export const KCPTUN_CRYPTS = [
  'aes',
  'aes-128',
  'aes-192',
  'salsa20',
  'blowfish',
  'twofish',
  'cast5',
  '3des',
  'tea',
  'xtea',
  'xor',
  'none'
] as const

export const SNEL_VERSIONS = ['1', '2', '3', '4', '5'] as const

export const HYSTERIA_PROTOCOLS = ['udp', 'wechat-video', 'faketcp'] as const

export const HYSTERIA2_OBFS = ['salamander', 'gecko'] as const

export const BBR_PROFILES = ['standard', 'conservative', 'aggressive'] as const

export const TUIC_RELAY_MODES = ['native', 'quic'] as const

export const SUDOKU_AEAD_METHODS = ['chacha20-poly1305', 'aes-128-gcm', 'none'] as const

export const SUDOKU_TABLE_TYPES = [
  'entropy',
  'prefer_entropy',
  'ascii',
  'prefer_ascii',
  'up_ascii_down_entropy',
  'up_entropy_down_ascii'
] as const

export const SUDOKU_MULTIPLEX = ['off', 'auto', 'on'] as const

export const MIERU_TRANSPORTS = ['TCP', 'UDP'] as const

export const MIERU_MULTIPLEXING = [
  'MULTIPLEXING_DEFAULT',
  'MULTIPLEXING_OFF',
  'MULTIPLEXING_LOW',
  'MULTIPLEXING_MIDDLE',
  'MULTIPLEXING_HIGH'
] as const

export const MIERU_HANDSHAKE_MODES = [
  'HANDSHAKE_DEFAULT',
  'HANDSHAKE_STANDARD',
  'HANDSHAKE_NO_WAIT'
] as const

export const SSH_HOST_KEY_ALGORITHMS = [
  'ssh-ed25519',
  'ecdsa-sha2-nistp256',
  'ecdsa-sha2-nistp384',
  'ecdsa-sha2-nistp521',
  'rsa-sha2-256',
  'rsa-sha2-512',
  'ssh-rsa',
  'ssh-dss'
] as const

export const OPENVPN_PROTOS = ['udp', 'udp4', 'tcp', 'tcp-client', 'tcp4', 'tcp4-client'] as const

export const OPENVPN_AUTHS = ['MD5', 'SHA1', 'SHA256', 'SHA384', 'SHA512'] as const

export const OPENVPN_COMP_LZO = ['yes', 'no', 'adaptive'] as const

export const OPENVPN_KEY_DIRECTIONS = ['1', '0'] as const

export const ZEROTIER_TCP_FALLBACK_MODES = ['disabled', 'direct', 'relay'] as const

export const IP_STACK_MODES = ['auto', 'gvisor', 'system', 'mixed'] as const

export const MKCP_HEADERS = [
  'none',
  'noop',
  'srtp',
  'utp',
  'wechat-video',
  'wechat',
  'dtls',
  'wireguard'
] as const

export const SMUX_PROTOCOLS = ['smux', 'yamux', 'h2mux'] as const

export const XHTTP_MODES = ['auto', 'packet-up', 'stream-up', 'stream-one'] as const

export const HTTP_METHODS = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'] as const

export const TLS_ALPN = ['h2', 'http/1.1', 'h3'] as const

export const EARLY_DATA_HEADER_NAMES = ['Sec-WebSocket-Protocol'] as const

export const SHADOW_TLS_VERSIONS = ['1', '2', '3'] as const

export const RESTLS_VERSION_HINTS = ['tls12', 'tls13'] as const

export const TROJAN_SS_METHODS = [
  'aes-128-gcm',
  'aes-256-gcm',
  'chacha20-ietf-poly1305',
  '2022-blake3-aes-128-gcm',
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305'
] as const
