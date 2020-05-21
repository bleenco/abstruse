package util

import (
	"net"
	"strings"
	"fmt"
)

// GetAvailablePort returns a port at random
func GetAvailablePort() int {
	l, _ := net.Listen("tcp", ":0") // listen on localhost
	defer l.Close()
	port := l.Addr().(*net.TCPAddr).Port

	return port
}

func GetExternalIP() (string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}
		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return "", err
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
			return ip.String(), nil
		}
	}
	return "", fmt.Errorf("are you connected to the network?")
}

// GetLocalIP4 gets local ip address.
func GetLocalIP4() (ip string) {
	interfaces, err := net.Interfaces()
	net.InterfaceAddrs()
	if err != nil {
		return
	}
	if len(interfaces) == 2 {
		for _, face := range interfaces {
			if strings.Contains(face.Name, "lo") {
				continue
			}
			addrs, err := face.Addrs()
			if err != nil {
				return
			}
			for _, addr := range addrs {
				if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
					if ipnet.IP.To4() != nil {
						currIP := ipnet.IP.String()
						if !strings.Contains(currIP, ":") && currIP != "127.0.0.1" {
							ip = currIP
						}
					}
				}
			}
		}
	}
	for _, face := range interfaces {
		if strings.Contains(face.Name, "lo") {
			continue
		}
		addrs, err := face.Addrs()
		if err != nil {
			return
		}
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
				if ipnet.IP.To4() != nil {
					currIP := ipnet.IP.String()
					if !strings.Contains(currIP, ":") && currIP != "127.0.0.1" && isIntranetIpv4(currIP) {
						ip = currIP
					}
				}
			}
		}
	}

	return
}

func isIntranetIpv4(ip string) bool {
	if strings.HasPrefix(ip, "192.168.") ||
		strings.HasPrefix(ip, "169.254.") ||
		strings.HasPrefix(ip, "172.") ||
		strings.HasPrefix(ip, "10.30.") ||
		strings.HasPrefix(ip, "10.31.") {
		return true
	}
	return false
}
