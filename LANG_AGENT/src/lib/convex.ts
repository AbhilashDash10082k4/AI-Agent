import { ConvexHttpClient } from "convex/browser";

export default function getConvexClient() {
    
    return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

}