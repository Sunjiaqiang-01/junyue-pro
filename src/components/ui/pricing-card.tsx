import React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-transparent relative w-full max-w-xs rounded-lg",
        "border border-white/5 hover:border-white/10 transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

function Header({
  className,
  children,
  glassEffect = true,
  ...props
}: React.ComponentProps<"div"> & {
  glassEffect?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-transparent relative mb-4 rounded-lg border-b border-white/5 p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Plan({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-8 flex items-center justify-between", className)} {...props} />;
}

function Description({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-secondary/50 text-sm", className)} {...props} />;
}

function PlanName({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-pure-white flex items-center gap-2 text-lg font-medium [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  );
}

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "bg-transparent border-primary-cyan/30 text-primary-cyan rounded-full border px-3 py-1 text-xs font-medium",
        className
      )}
      {...props}
    />
  );
}

function Price({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4 flex items-end gap-2", className)} {...props} />;
}

function MainPrice({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-4xl font-semibold tracking-tight text-primary-cyan", className)}
      {...props}
    />
  );
}

function Period({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-secondary/40 pb-1 text-base", className)} {...props} />;
}

function OriginalPrice({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-secondary/30 mr-1 ml-auto text-lg line-through", className)}
      {...props}
    />
  );
}

function Body({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-4 p-6", className)} {...props} />;
}

function List({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("space-y-3", className)} {...props} />;
}

function ListItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("text-secondary/60 flex items-start gap-3 text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

function Separator({
  children = "Upgrade to access",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-secondary/40 flex items-center gap-3 text-sm", className)} {...props}>
      <span className="bg-white/5 h-[1px] flex-1" />
      <span className="text-secondary/40 shrink-0">{children}</span>
      <span className="bg-white/5 h-[1px] flex-1" />
    </div>
  );
}

export {
  Card,
  Header,
  Description,
  Plan,
  PlanName,
  Badge,
  Price,
  MainPrice,
  Period,
  OriginalPrice,
  Body,
  List,
  ListItem,
  Separator,
};
