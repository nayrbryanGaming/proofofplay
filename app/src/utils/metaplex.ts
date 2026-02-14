import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";

// Define strict interfaces for the metadata structure
interface Attribute {
    trait_type: string;
    value: string | number;
}

interface NftMetadata {
    name: string;
    image: string;
    attributes?: Attribute[];
    uri: string;
}

interface NftStats {
    name: string;
    atk: number;
    image: string;
}

// Modern Metaplex UMI SDK for reading NFT metadata
// This reads the on-chain metadata and fetches the JSON from the URI
export async function fetchNftStats(rpcEndpoint: string, mintAddress: string): Promise<NftStats | null> {
    try {
        const umi = createUmi(rpcEndpoint);
        const mint = publicKey(mintAddress);
        const asset = await fetchDigitalAsset(umi, mint);

        // Fetch the JSON from the URI
        const uri = asset.metadata.uri;
        const response = await fetch(uri);
        const json: NftMetadata = await response.json();

        // Extract ATK attribute from metadata
        const atkAttr = json.attributes?.find((a) => a.trait_type === "ATK");

        return {
            name: json.name || "Unknown Item",
            atk: atkAttr ? Number(atkAttr.value) : 0,
            image: json.image || ""
        };
    } catch (e) {
        console.error("Failed to fetch NFT metadata:", e);
        return null;
    }
}
