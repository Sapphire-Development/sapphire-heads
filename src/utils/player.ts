import type { Head } from "../types";

export async function generatePlayerHead(username: string): Promise<Head> {
    const res = await fetch(`https://playerdb.co/api/player/minecraft/${username}`);
    if (!res.ok) throw new Error("Player not found");

    const data = await res.json();

    if (!data.success || !data.data || !data.data.player) {
        throw new Error("Invalid response from API");
    }

    const properties = data.data.player.properties;
    const textureProp = properties.find((p: any) => p.name === "textures");

    if (!textureProp || !textureProp.value) {
        throw new Error("No skin data found for this player");
    }

    const decodedValue = atob(textureProp.value);
    const skinJson = JSON.parse(decodedValue);

    const skinUrl = skinJson.textures?.SKIN?.url;
    if (!skinUrl) throw new Error("No skin URL found");

    const textureId = skinUrl.split("/").pop();

    if (!textureId) throw new Error("Could not parse texture ID");

    return {
        id: 0,
        name: data.data.player.username,
        category: "Player",
        tags: ["Player", "Custom"],
        texture: textureId,
    };
}
