import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

export default function BreadCrumb({ items }) {
  return (
    <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href={"/admin"}
        className="overflow-hidden text-ellipsis whitespace-nowrap"
      >
        Dashboard
      </Link>
      {items?.map((item, index) => (
        <React.Fragment key={item.title}>
          <ChevronRightIcon className="h-4 w-4" />
          <Link
            href={item.link}
            className={cn(
              "font-medium",
              index === items.length - 1
                ? "pointer-events-none text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}