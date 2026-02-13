import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";

// Modern Metaplex UMI SDK for reading NFT metadata
// This reads the on-chain metadata and fetches the JSON from the URI
export async function fetchNftStats(rpcEndpoint: string, mintAddress: string) {
    try {
        const umi = createUmi(rpcEndpoint);
        const mint = publicKey(mintAddress);
        const asset = await fetchDigitalAsset(umi, mint);

        // Fetch the JSON from the URI
        const uri = asset.metadata.uri;
        const response = await fetch(uri);
        const json = await response.json();

        // Extract ATK attribute from metadata
        const atkAttr = json.attributes?.find((a: any) => a.trait_type === "ATK");

        return {
            name: json.name,
            atk: atkAttr ? parseInt(atkAttr.value) : 0,
            image: json.image
        };
    } catch (e) {
        console.error("Failed to fetch NFT metadata:", e);
        return null;
    }
}
