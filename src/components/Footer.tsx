"use client";

import { useEffect, useState } from 'react';
import { useRPC2Call } from '@/contexts/RPC2Context';

const Footer = () => {
  // 格式化 build 时间
  const formatBuildTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai'
    }) + ' (GMT+8)';
  };

  const buildTime = null; // Build time can be set via environment variable if needed
  const [versionInfo, setVersionInfo] = useState<{ hash: string; version: string } | null>(null);
  const { call } = useRPC2Call();

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const data = await call("common:getVersion")
        setVersionInfo({ hash: data.hash?.slice(0, 7), version: data.version });
      } catch (error) {
        console.error('Failed to fetch version info:', error);
      }
    };

    fetchVersionInfo();
  }, [call]);

  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 py-10 px-4">
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground font-bold text-xs">K</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Komari Monitor
            </p>
          </div>
          <p className="text-sm text-muted-foreground/60 max-w-xs text-center md:text-left">
            Supports <span className="font-semibold text-foreground">Komari</span> & Powered by{" "}
            <a
              href="https://github.com/tonyliuzj/komari-next/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground hover:underline"
            >
              Komari-Next
            </a>
          </p>


          {buildTime && (
            <p className="text-xs text-muted-foreground">
              Build Time: {formatBuildTime(buildTime)}
            </p>
          )}
          {versionInfo && (
            <p className="text-xs text-muted-foreground">
              Version: {versionInfo.version} ({versionInfo.hash})
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
