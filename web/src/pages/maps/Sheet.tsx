import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Datatype2 } from ".";
import * as changeCase from "change-case";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import DropdownMenuComponent from "./DropdownMenuComponent";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardWithForm } from "./EditCard";
import useItemEditStore from "@/stores/useItemEditStore";
import { Card } from "@/components/ui/card";
import { useEditStore } from "@/stores/useItemEditStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the reusable function
const RenderFormattedItems = (
  items: string[],
  handleEdit: () => void,
  handleRevert: () => void,
  type: "grantor" | "grantee"
) => {
  const { granteeEditIndex, grantorEditIndex } = useItemEditStore();
  const { originalGrantorNames, originalGranteeNames } = useEditStore();

  if (items.length === 0) {
    return <div className="text-sm">No Owner</div>;
  } else if (items.length === 1 && items[0] === "") {
    return <div className="text-sm">No Owner</div>;
  }
  {
    console.log(items);
  }
  return items.map((item, index) => {
    const currentEditIndex =
      type === "grantee" ? granteeEditIndex : grantorEditIndex;

    let isEdited;

    if (type === "grantor") {
      isEdited = item !== originalGrantorNames[index];
    } else {
      isEdited = item !== originalGranteeNames[index];
    }

    const textStyle = isEdited ? `text-cyan-700	` : ``;

    return (
      <div key={index}>
        <div className="mb-1 justify-between flex items-center">
          {index === currentEditIndex ? (
            <CardWithForm
              initialName={item}
              type={type}
              editIndex={currentEditIndex}
            />
          ) : (
            <>
              {isEdited ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={`flex text-sm ${textStyle}`}>{item}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>edited. revert in dropdown menu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className={`flex text-sm ${textStyle}`}>{item}</div>
              )}
              <DropdownMenuComponent
                index={index}
                fullName={item}
                onEdit={handleEdit}
                onRevert={handleRevert}
                type={type}
              />
            </>
          )}
        </div>
      </div>
    );
  });
};

export function SheetDemo({
  isSheetOpen,
  propertyData,
}: // onClose,
{
  isSheetOpen: boolean;
  propertyData: Datatype2;
  // onClose: () => void;
}) {
  const {
    apn,
    block,
    booknumber,
    booktype,
    createdat,
    documentdate,
    documentid,
    filingcode,
    grantee,
    grantor,
    id,
    latitude,
    longitude,
    lot,
    nameinternalid,
    names,
    numberofpages,
    primarydocnumber,
    secondarydocnumber,
    totalnamescount,
    updatedat,
  } = propertyData;

  const router = useRouter();
  const [currentPropertyData, setCurrentPropertyData] =
    useState<Datatype2 | null>(null);

  const grantorSplit = grantor.split(",");
  const granteeSplit = grantee.split(",");

  const grantorSplitFormated = grantorSplit.map((item) =>
    changeCase.capitalCase(item)
  );
  const granteeSplitFormated = granteeSplit.map((item) =>
    changeCase.capitalCase(item)
  );

  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(propertyData.grantee);
  const [originalItem, setOriginalItem] = useState(propertyData.grantee);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    setOriginalItem(currentItem);
    setEditMode(false);
  };

  const handleRevert = () => {
    setCurrentItem(originalItem);
    setEditMode(false);
  };

  const { resetEditIndices } = useItemEditStore();

  const handleClose = () => {
    resetEditIndices();
  };

  const {
    initializeGrantorNames,
    initializeGranteeNames,
    grantorNames,
    granteeNames,
    initializeOriginalGrantorNames,
    initializeOriginalGranteeNames,
    originalGrantorNames,
    originalGranteeNames,
  } = useEditStore();

  // initialize the original names to use for later
  useEffect(() => {
    const grantorSplit = grantor.split(",");
    const granteeSplit = grantee.split(",");

    const grantorSplitFormated = grantorSplit.map((item) =>
      changeCase.capitalCase(item)
    );
    const granteeSplitFormated = granteeSplit.map((item) =>
      changeCase.capitalCase(item)
    );

    initializeGrantorNames(grantorSplitFormated);
    initializeGranteeNames(granteeSplitFormated);
    initializeOriginalGrantorNames(grantorSplitFormated);
    initializeOriginalGranteeNames(granteeSplitFormated);
  }, [
    grantee,
    grantor,
    initializeGranteeNames,
    initializeGrantorNames,
    initializeOriginalGranteeNames,
    initializeOriginalGrantorNames,
  ]);

  return (
    <Sheet open={isSheetOpen} modal={false} onOpenChange={handleClose}>
      <SheetContent className="p-0">
        <ScrollArea className="h-[100vh] w-full p-6">
          <SheetHeader>
            <SheetTitle>APN: {apn}</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="name"
                className="text-left col-span-4 text-muted-foreground"
              >
                Current Owner
              </Label>
              <div className="col-span-4">
                {RenderFormattedItems(
                  granteeNames,
                  handleEdit,
                  handleRevert,
                  "grantee"
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="name"
                className="text-left col-span-4 text-muted-foreground"
              >
                Previous Owner
              </Label>
              {/* <Input id="name" value="Pedro Duarte" className="col-span-3" /> */}
              <div className="col-span-4">
                {RenderFormattedItems(
                  grantorNames,
                  handleEdit,
                  handleRevert,
                  "grantor"
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            {Object.entries(propertyData).map(([key, value]) => {
              if (!["grantor", "grantee", "apn"].includes(key)) {
                return (
                  <Fragment key={key}>
                    <h4 className="text-sm font-medium leading-none text-left col-span-4 -mb-2 text-muted-foreground">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </h4>
                    <p className="col-span-4 text-sm">{value}</p>
                  </Fragment>
                );
              }
              return null;
            })}
          </div>
          <SheetFooter>
            {/* <SheetClose asChild >
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
