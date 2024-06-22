import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import useItemEditStore from "@/stores/useItemEditStore";

// 2 buttons
// 1. do a google search for the person
// 2. do a specific google search with filetype PDF, name, sheets
// 3. edit the name, then do a google search
// 4. click on edit and it turns the component into an input field with a save button
// 5. investor search?

const dorkingString = "filetype:pdf OR filetype:xlsx OR filetype:docx";

interface DropdownMenuComponentProps {
  onEdit: () => void;
  onRevert: () => void;
}

interface DropdownMenuComponentProps {
  actions: { label: string; action: () => void }[];
}

export default function DropdownMenuComponent<DropdownMenuComponentProps>({
  fullName,
  onEdit,
  onRevert,
  index,
  type,
}: // actions,
{
  fullName: string;
  onEdit: () => void;
  onRevert: () => void;
  index: number;
  type: "grantor" | "grantee";
}) {
  const {
    setGranteeEditIndex,
    setGrantorEditIndex,
    granteeEditIndex,
    grantorEditIndex,
  } = useItemEditStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              const encodedName = encodeURIComponent(
                '"' + fullName + '"' + " " + dorkingString
              );
              const searchUrl = `https://www.google.com/search?q=${encodedName}`;
              window.open(searchUrl, "_blank");
            }}
          >
            Profile Scan
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const encodedName = encodeURIComponent('"' + fullName + '"');
              const searchUrl = `https://www.google.com/search?q=${encodedName}`;
              window.open(searchUrl, "_blank");
            }}
          >
            Quote Google Search
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>

          {/* true people search
          https://www.truepeoplesearch.com/results?name=Boesch%20Peter&citystatezip=San%20Francisco,%20CA */}

          <DropdownMenuItem
            onClick={() => {
              const encodedName = encodeURIComponent(fullName);
              const searchUrl = `https://www.truepeoplesearch.com/results?name=${encodedName}&citystatezip=${encodeURIComponent(
                "San Francisco, CA"
              )}`;
              window.open(searchUrl, "_blank");
            }}
          >
            True People Search
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              if (type === "grantee") {
                setGranteeEditIndex(index);
              } else {
                setGrantorEditIndex(index);
              }
            }}
          >
            Edit name
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              if (type === "grantee") {
                setGranteeEditIndex(null);
              } else {
                setGrantorEditIndex(null);
              }
            }}
          >
            Revert name to original
          </DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
