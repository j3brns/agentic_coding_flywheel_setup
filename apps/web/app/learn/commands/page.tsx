import { Metadata } from "next";
import { CommandReference } from "./command-reference";

export const metadata: Metadata = {
  title: "Command Reference | ACFS Learning Hub",
  description:
    "Searchable reference of every command installed by ACFS, with examples and quick copy buttons.",
};

export default function CommandReferencePage() {
  return <CommandReference />;
}
