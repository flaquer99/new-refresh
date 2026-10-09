import ipaddr from "ipaddr.js";

const PUBLIC_RANGE = "unicast";
const IPV4_COMPATIBLE_IPV6 = ipaddr.IPv6.parseCIDR("::/96");

const isIpv4Compatible = (address: ipaddr.IPv4 | ipaddr.IPv6): boolean =>
  address instanceof ipaddr.IPv6 && address.match(IPV4_COMPATIBLE_IPV6);

export const isPublicAddress = (ip: string): boolean => {
  if (!ipaddr.isValid(ip)) {
    return false;
  }
  const address = ipaddr.process(ip);
  if (isIpv4Compatible(address)) {
    return false;
  }
  return address.range() === PUBLIC_RANGE;
};
