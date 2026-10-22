"use client"

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"

/** A trigger and the plate it opens. */
function Menu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="menu" {...props} />
}

/** Opens the plate. Renders a button; pass `render` to use your own. */
function MenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />
}

const plate = cn(
  "menu-plate flex max-h-(--available-height) min-w-(--menu-min-width) origin-(--transform-origin) flex-col overflow-y-auto overscroll-contain rounded-(--bevel-radius-md) p-1 text-sm outline-none",
  "transition-[translate,opacity] duration-(--bevel-duration-small) ease-(--bevel-ease-out) motion-reduce:transition-none",
  "data-starting-style:opacity-0 data-ending-style:opacity-0",
  "data-[side=bottom]:data-starting-style:-translate-y-(--menu-lift) data-[side=top]:data-starting-style:translate-y-(--menu-lift)",
  "data-[side=right]:data-starting-style:-translate-x-(--menu-lift) data-[side=left]:data-starting-style:translate-x-(--menu-lift)",
  "forced-colors:border forced-colors:border-[CanvasText]"
)

type MenuContentProps = MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding">

/** The plate: brushed metal, items engraved into it. Drops a short way from the trigger. */
function MenuContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  alignOffset = 0,
  collisionPadding = 8,
  ...props
}: MenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className="z-50 outline-none"
      >
        <MenuPrimitive.Popup data-slot="menu-content" className={cn(plate, className)} {...props} />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/* The highlighted item sits pressed into the plate. */
const item = cn(
  "relative flex min-h-8 cursor-default items-center gap-2 rounded-(--bevel-radius-sm) px-2 py-1.5 outline-none select-none",
  "data-highlighted:bevel-pressed data-highlighted:[text-shadow:none]",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
  "data-[variant=destructive]:text-(--menu-danger)",
  "forced-colors:data-highlighted:outline forced-colors:data-highlighted:outline-[Highlight]",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-(--menu-ink-muted) data-[variant=destructive]:[&_svg]:text-current"
)

type MenuItemProps = MenuPrimitive.Item.Props & {
  /** "destructive" engraves the item in red, for delete and the like. */
  variant?: "default" | "destructive"
}

function MenuItem({ className, variant = "default", ...props }: MenuItemProps) {
  return <MenuPrimitive.Item data-slot="menu-item" data-variant={variant} className={cn(item, className)} {...props} />
}

/** An item that navigates: a real link, so it opens in a new tab and shows its address. */
function MenuLinkItem({ className, ...props }: MenuPrimitive.LinkItem.Props) {
  return <MenuPrimitive.LinkItem data-slot="menu-link-item" className={cn(item, className)} {...props} />
}

/** A small lamp: lit when its item is checked. The pill is a checkbox, the round one a radio. */
function MenuLamp({ shape }: { shape: "pill" | "round" }) {
  return (
    <span
      aria-hidden
      data-slot="menu-lamp"
      className={cn(
        "bevel-led shrink-0 forced-color-adjust-none forced-colors:border forced-colors:border-[CanvasText] in-data-checked:forced-colors:bg-[Highlight]",
        shape === "pill" ? "h-1.5 w-2.5 rounded-full" : "size-2 rounded-full"
      )}
    />
  )
}

/** A setting you turn on and off. A lamp on the left lights when it's on. */
function MenuCheckboxItem({ className, children, ...props }: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menu-checkbox-item"
      closeOnClick={false}
      className={cn(item, "pl-2.5", className)}
      {...props}
    >
      <MenuLamp shape="pill" />
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />
}

/** One of a set. The chosen one's lamp is lit. */
function MenuRadioItem({ className, children, ...props }: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="menu-radio-item"
      closeOnClick={false}
      className={cn(item, "pl-2.5", className)}
      {...props}
    >
      <MenuLamp shape="round" />
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function MenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />
}

/** A small stamped heading over a group. */
function MenuGroupLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menu-group-label"
      className={cn(
        "px-2 pt-2 pb-1 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-label) text-(--menu-ink-muted) uppercase",
        className
      )}
      {...props}
    />
  )
}

/** An engraved rule between groups. */
function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return <MenuPrimitive.Separator data-slot="menu-separator" className={cn("menu-rule -mx-1 my-1", className)} {...props} />
}

type MenuShortcutProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** One keycap per key, e.g. ["⌘", "C"]. Also set aria-keyshortcuts on the item. */
  keys: string[]
}

/** The item's keyboard shortcut, as small keycaps at the end of the row. Hidden from screen readers. */
function MenuShortcut({ className, keys, ...props }: MenuShortcutProps) {
  return (
    <span
      aria-hidden
      data-slot="menu-shortcut"
      className={cn("ml-auto flex shrink-0 items-center gap-0.5 pl-4 [text-shadow:none]", className)}
      {...props}
    >
      {keys.map((key, i) => (
        <kbd
          key={i}
          data-slot="menu-key"
          className="bevel-raised inline-flex h-(--menu-key-size) min-w-(--menu-key-size) -translate-y-px items-center justify-center rounded-(--bevel-radius-xs) px-1 font-sans text-(length:--bevel-fine) leading-none font-medium text-(--menu-key-foreground)"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

/** Holds a submenu: its trigger item and its own plate. */
function MenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="menu-sub" {...props} />
}

/** The item that opens a submenu, with a chevron. Opens on hover, → or Enter. */
function MenuSubTrigger({ className, children, ...props }: MenuPrimitive.SubmenuTrigger.Props) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="menu-sub-trigger"
      className={cn(item, "data-popup-open:bevel-pressed data-popup-open:[text-shadow:none]", className)}
      {...props}
    >
      {children}
      <svg aria-hidden viewBox="0 0 16 16" className="ml-auto" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4l4 4-4 4" />
      </svg>
    </MenuPrimitive.SubmenuTrigger>
  )
}

/** A submenu's plate. Opens beside its trigger. */
function MenuSubContent({ side = "right", align = "start", sideOffset = 2, alignOffset = -4, ...props }: MenuContentProps) {
  return <MenuContent side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} {...props} />
}

/** Right-click (or long-press) an area to open a plate at the pointer. */
function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

/** The area that opens the context menu. Renders a div. */
function ContextMenuTrigger(props: ContextMenuPrimitive.Trigger.Props) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
}

/** The context menu's plate, at the pointer. Fill it with the same Menu items. */
function ContextMenuContent({
  className,
  ...props
}: MenuPrimitive.Popup.Props & Pick<ContextMenuPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset">) {
  const { side, align, sideOffset, alignOffset, ...popup } = props
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={8}
        className="z-50 outline-none"
      >
        <ContextMenuPrimitive.Popup data-slot="menu-content" className={cn(plate, className)} {...popup} />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
}
export type { MenuContentProps, MenuItemProps, MenuShortcutProps }
