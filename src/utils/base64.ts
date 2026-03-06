import { getTextureUrl } from "./image";

export function getHeadBase64(textureId: string): string {
    const valueJson = {
        textures: {
            SKIN: {
                url: getTextureUrl(textureId),
            },
        },
    };
    return btoa(JSON.stringify(valueJson));
}
