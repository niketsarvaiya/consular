import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const metadata: Metadata = {
  title: "Explore Destinations",
  description:
    "Explore visa requirements for 190+ countries for Indian passport holders. Visa-free, e-Visa, on-arrival — see it all on one interactive world map.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
