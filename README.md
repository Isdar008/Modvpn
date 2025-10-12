# Instalasi
```
sysctl -w net.ipv6.conf.all.disable_ipv6=1 \
&& sysctl -w net.ipv6.conf.default.disable_ipv6=1 \
&& apt update -y \
&& apt install -y git curl \
&& curl -L -k -sS https://raw.githubusercontent.com/Isdar008/Modvpn/main/start -o start \
&& chmod +x start \
&& ./start \
&& [ $? -eq 0 ] && rm -f start
```
