"use client";

import React, { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Clock, Globe, Activity, ArrowUpRight, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import NodeDisplay from "@/components/NodeDisplay";
import { formatBytes } from "@/utils/unitHelper";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import Loading from "@/components/loading";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CurrentTimeCard } from "@/components/CurrentTimeCard";
import { Callouts } from "@/components/DashboardCallouts";

// Intelligent speed formatting function
const formatSpeed = (bytes: number): string => {
  if (bytes === 0) return "0 B/s";
  const units = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  // Adaptive decimal places
  let decimals = 2;
  if (i >= 3) decimals = 1; // GB and above: 1 decimal
  if (i <= 1) decimals = 0; // B and KB: no decimals
  if (size >= 100) decimals = 0; // 100+ of any unit: no decimals

  return `${size.toFixed(decimals)} ${units[i]}`;
};

export default function DashboardContent() {
  const [t] = useTranslation();
  const { live_data } = useLiveData();
  const { publicInfo } = usePublicInfo();
  
  // Sync document title with backend-set custom title
  useEffect(() => {
    if (publicInfo?.sitename) {
      document.title = publicInfo.sitename;
    }
  }, [publicInfo?.sitename]);
  
  //#region 节点数据
  const { nodeList, isLoading, error, refresh } = useNodeList();

  // Status cards visibility state
  const [statusCardsVisibility, setStatusCardsVisibility] = useLocalStorage(
    "statusCardsVisibility",
    {
      currentTime: true,
      currentOnline: true,
      regionOverview: true,
      trafficOverview: true,
      networkSpeed: true,
    }
  );

  // Status cards configuration
  const statusCards = [
    {
      key: "currentTime",
      title: t("current_time"),
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      renderValue: () => <CurrentTimeCard />,
      visible: statusCardsVisibility.currentTime,
    },
    {
      key: "currentOnline",
      title: t("current_online"),
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      getValue: () =>
        `${live_data?.data?.online.length ?? 0} / ${nodeList?.length ?? 0}`,
      visible: statusCardsVisibility.currentOnline,
    },
    {
      key: "regionOverview",
      title: t("region_overview"),
      icon: <Globe className="h-4 w-4 text-muted-foreground" />,
      getValue: () =>
        nodeList
          ? Object.entries(
              nodeList.reduce((acc, item) => {
                if (live_data?.data.online.includes(item.uuid)) {
                  acc[item.region] = (acc[item.region] || 0) + 1;
                }
                return acc;
              }, {} as Record<string, number>)
            ).length
          : 0,
      visible: statusCardsVisibility.regionOverview,
    },
    {
      key: "trafficOverview",
      title: t("traffic_overview"),
      icon: <ArrowUpRight className="h-4 w-4 text-muted-foreground" />,
      getValue: () => {
        const data = live_data?.data?.data;
        const online = live_data?.data?.online;
        if (!data || !online) return "↑ 0B / ↓ 0B";
        const onlineSet = new Set(online);
        const values = Object.entries(data)
          .filter(([uuid]) => onlineSet.has(uuid))
          .map(([, node]) => node);
        const up = values.reduce(
          (acc, node) => acc + (node.network.totalUp || 0),
          0
        );
        const down = values.reduce(
          (acc, node) => acc + (node.network.totalDown || 0),
          0
        );
        return `↑ ${formatBytes(up)} / ↓ ${formatBytes(down)}`;
      },
      visible: statusCardsVisibility.trafficOverview,
    },
    {
      key: "networkSpeed",
      title: t("network_speed"),
      icon: <Zap className="h-4 w-4 text-muted-foreground" />,
      getValue: () => {
        const data = live_data?.data?.data;
        const online = live_data?.data?.online;
        if (!data || !online) return "↑ 0 B/s / ↓ 0 B/s";
        const onlineSet = new Set(online);
        const values = Object.entries(data)
          .filter(([uuid]) => onlineSet.has(uuid))
          .map(([, node]) => node);
        const up = values.reduce(
          (acc, node) => acc + (node.network.up || 0),
          0
        );
        const down = values.reduce(
          (acc, node) => acc + (node.network.down || 0),
          0
        );
        return `↑ ${formatSpeed(up)} / ↓ ${formatSpeed(down)}`;
      },
      visible: statusCardsVisibility.networkSpeed,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [nodeList, refresh]);

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  //#endregion

  return (
    <div className="container mx-auto px-4 space-y-8">
      <Callouts />

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-bold tracking-tight">{t("common.dashboard", { defaultValue: "Dashboard" })}</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t("status_settings")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-4" align="end">
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold leading-none">{t("status_settings")}</h4>
                <div className="flex flex-col gap-3">
                  {statusCards.map((card) => (
                    <StatusSettingSwitch
                      key={card.key}
                      label={card.title}
                      checked={card.visible}
                      onCheckedChange={(checked) =>
                        setStatusCardsVisibility({
                          ...statusCardsVisibility,
                          [card.key]: checked,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statusCards
            .filter((card) => card.visible)
            .map((card) => (
              <TopCard
                key={card.key}
                title={card.title}
                value={card.renderValue ? card.renderValue() : card.getValue?.()}
                icon={card.icon}
              />
            ))}
        </div>
      </div>

      <Suspense fallback={<div className="p-4">Loading nodes...</div>}>
        <NodeDisplay
          nodes={nodeList ?? []}
          liveData={live_data?.data ?? { online: [], data: {} }}
        />
      </Suspense>
    </div>
  );
}

type TopCardProps = {
  title: string;
  value: string | number | React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
};

const TopCard: React.FC<TopCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

type StatusSettingSwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const StatusSettingSwitch: React.FC<StatusSettingSwitchProps> = ({
  label,
  checked,
  onCheckedChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};
