import type { SimpleNodeType } from '../types'
import { ss } from './ss'
import { ssr } from './ssr'
import { socks5 } from './socks5'
import { http } from './http'
import { vmess } from './vmess'
import { vless } from './vless'
import { snell } from './snell'
import { trojan } from './trojan'
import { hysteria } from './hysteria'
import { hysteria2 } from './hysteria2'
import { wireguard } from './wireguard'
import { tuic } from './tuic'
import { shadowquic } from './shadowquic'
import { gostRelay } from './gost-relay'
import { direct } from './direct'
import { dns } from './dns'
import { reject } from './reject'
import { rematch } from './rematch'
import { ssh } from './ssh'
import { mieru } from './mieru'
import { anytls } from './anytls'
import { sudoku } from './sudoku'
import { masque } from './masque'
import { trusttunnel } from './trusttunnel'
import { openvpn } from './openvpn'
import { tailscale } from './tailscale'
import { zerotier } from './zerotier'
import { easytier } from './easytier'

export const SIMPLE_NODE_PROTOCOLS: Record<string, SimpleNodeType> = {
  ss: ss,
  ssr: ssr,
  socks5: socks5,
  http: http,
  vmess: vmess,
  vless: vless,
  snell: snell,
  trojan: trojan,
  hysteria: hysteria,
  hysteria2: hysteria2,
  wireguard: wireguard,
  tuic: tuic,
  shadowquic: shadowquic,
  'gost-relay': gostRelay,
  direct: direct,
  dns: dns,
  reject: reject,
  rematch: rematch,
  ssh: ssh,
  mieru: mieru,
  anytls: anytls,
  sudoku: sudoku,
  masque: masque,
  trusttunnel: trusttunnel,
  openvpn: openvpn,
  tailscale: tailscale,
  zerotier: zerotier,
  easytier: easytier
}
