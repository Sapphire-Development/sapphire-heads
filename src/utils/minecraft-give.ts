type VersionRange = [number, number];

interface CommandEntry {
  range: VersionRange;
  command: string;
}

const commandStructure: CommandEntry[] = [
  {
    range: [800, 1200],
    command: `/give @p minecraft:skull 1 3 {display:{Name:"{name}"},SkullOwner:{Id:"997fd87f-4c59-4f34-af7e-c06675709479",Properties:{textures:[{Value:"{texture}"}]}}}`
  },
  {
    range: [1300, 1300],
    command: `/give @p minecraft:player_head{display:{Name:"{\"text\":\"{name}\"}"},SkullOwner:{Id:"997fd87f-4c59-4f34-af7e-c06675709479",Properties:{textures:[{Value:"{texture}"}]}}} 1`
  },
  {
    range: [1400, 2004],
    command: `/give @p minecraft:player_head{display:{Name:'{"text":"{name}","color":"blue","underlined":true,"bold":true,"italic":false}'},SkullOwner:{Id:"997fd87f-4c59-4f34-af7e-c06675709479",Properties:{textures:[{Value:"{texture}"}]}}} 1`
  },
  {
    range: [2005, 2104],
    command: `/give @p minecraft:player_head[minecraft:custom_name='{"text":"{name}","color":"blue","underlined":true,"bold":true,"italic":false}',profile={id:[I;-1719674753,1280921396,-1350647706,1970312313],properties:[{name:"textures",value:"{texture}"}]}] 1`
  },
  {
    range: [2105, 2108],
    command: `/give @p minecraft:player_head[minecraft:custom_name={text:"{name}",color:"blue",underlined:true,bold:true,italic:false},profile={id:[I;-1719674753,1280921396,-1350647706,1970312313],properties:[{name:"textures",value:"{texture}"}]}] 1`
  },
  {
    range: [2109, 2111],
    command: `/give @p minecraft:player_head[minecraft:custom_name={text:"{name}",color:"blue",underlined:true,bold:true,italic:false},profile={properties:[{name:"textures",value:"{texture}"}]}] 1`
  }
];

function encodeVersion(
  major: number,
  minor: number,
  patch: number = 0
): number {
  return minor * 100 + patch;
}

function decodeVersion(
  encoded: number
): { major: number; minor: number; patch?: number } {
  const minor = Math.floor(encoded / 100);
  const patch = encoded % 100;

  return {
    major: 1,
    minor: minor,
    patch: patch === 0 ? undefined : patch
  };
}

function formatVersionString(encoded: number): string {
  const decoded = decodeVersion(encoded);
  if (decoded.patch !== undefined) {
    return `${decoded.major}.${decoded.minor}.${decoded.patch}`;
  }
  return `${decoded.major}.${decoded.minor}`;
}

function compareVersions(v1: number, v2: number): number {
  return v1 - v2;
}

function isVersionInRange(version: number, min: number, max: number): boolean {
  return version >= min && version <= max;
}

export interface VersionOption {
  value: string;
  label: string;
  encoded: number;
}

export interface VersionGroup {
  label: string;
  options: VersionOption[];
}

export function getSupportedVersionOptions(): VersionOption[] {
  const LATEST_VERSION = 2111;
  const options: VersionOption[] = [
    {
      value: "0",
      label: `Latest Version`,
      encoded: LATEST_VERSION
    }
  ];

  for (let minor = 21; minor >= 8; minor--) {
    if (minor === 21) {
      for (let patch = 11; patch >= 0; patch--) {
        const encoded = encodeVersion(1, minor, patch);
        options.push({
          value: encoded.toString(),
          label: `Minecraft ${formatVersionString(encoded)}`,
          encoded: encoded
        });
      }
    } else if (minor === 20) {
      for (let patch = 6; patch >= 0; patch--) {
        const encoded = encodeVersion(1, minor, patch);
        options.push({
          value: encoded.toString(),
          label: `Minecraft ${formatVersionString(encoded)}`,
          encoded: encoded
        });
      }
    } else {
      const encoded = encodeVersion(1, minor, 0);
      options.push({
        value: encoded.toString(),
        label: `Minecraft ${formatVersionString(encoded)}`,
        encoded: encoded
      });
    }
  }

  return options;
}

function generateVersionsInRange(minEncoded: number, maxEncoded: number): VersionOption[] {
  const options: VersionOption[] = [];
  const minDecoded = decodeVersion(minEncoded);
  const maxDecoded = decodeVersion(maxEncoded);
  
  const startMinor = minDecoded.minor;
  const endMinor = maxDecoded.minor;
  
  for (let minor = endMinor; minor >= startMinor; minor--) {
    const startPatch = minor === startMinor ? (minDecoded.patch || 0) : 0;
    let endPatch: number;
    
    if (minor === endMinor) {
      endPatch = maxDecoded.patch || 0;
    } else if (minor === 21) {
      endPatch = 11;
    } else if (minor === 20) {
      endPatch = 6;
    } else {
      endPatch = 0;
    }
    
    for (let patch = endPatch; patch >= startPatch; patch--) {
      const encoded = encodeVersion(1, minor, patch);
      if (encoded >= minEncoded && encoded <= maxEncoded) {
        options.push({
          value: encoded.toString(),
          label: `Minecraft ${formatVersionString(encoded)}`,
          encoded: encoded
        });
      }
    }
  }
  
  return options;
}

function formatRangeLabel(minEncoded: number, maxEncoded: number): string {
  const minStr = formatVersionString(minEncoded);
  const maxStr = formatVersionString(maxEncoded);
  
  if (minStr === maxStr) {
    return minStr;
  }
  
  return `${minStr} - ${maxStr}`;
}

export function getGroupedVersionOptions(): VersionGroup[] {
  const LATEST_VERSION = 2111;
  const groups: VersionGroup[] = [];
  
  const latestGroup: VersionGroup = {
    label: "Minecraft version",
    options: [
      {
        value: "0",
        label: `Latest Version (${formatVersionString(LATEST_VERSION)})`,
        encoded: LATEST_VERSION
      }
    ]
  };
  
  for (let i = commandStructure.length - 1; i >= 0; i--) {
    const entry = commandStructure[i];
    const [minEncoded, maxEncoded] = entry.range;
    
    const rangeLabel = formatRangeLabel(minEncoded, maxEncoded);
    
    latestGroup.options.push({
      value: maxEncoded.toString(),
      label: rangeLabel,
      encoded: maxEncoded
    });
  }
  
  groups.push(latestGroup);
  
  return groups;
}

export function getMinecraftGiveCommand(
  version: number | string,
  name: string,
  texture: string
): string {
  let encodedVersion: number;

  if (typeof version === "string") {
    if (version === "0") {
      encodedVersion = 2111;
    } else {
      encodedVersion = parseInt(version, 10);
    }
  } else {
    encodedVersion = version;
  }

  if (encodedVersion === 0) {
    encodedVersion = 2111;
  }

  const entry = commandStructure.find(cmd =>
    isVersionInRange(encodedVersion, cmd.range[0], cmd.range[1])
  );

  if (!entry) {
    throw new Error(`Unsupported Minecraft version: ${encodedVersion}`);
  }

  return entry.command.replace("{name}", name).replace("{texture}", texture);
}
