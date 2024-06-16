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

// Define the reusable function
const renderFormattedItems = (
  items: string[],
  handleEdit: () => void,
  handleRevert: () => void
) => {
  if (items.length === 0) {
    return <div className="text-sm">No Owner</div>;
  } else if (items.length === 1 && items[0] === "") {
    return <div className="text-sm">No Owner</div>;
  }
  return items.map((item, index) => (
    <div key={index} className="mb-1 justify-between flex items-center">
      <div className="flex text-sm">{item}</div>
      <DropdownMenuComponent
        fullName={item}
        onEdit={handleEdit}
        onRevert={handleRevert}
      />
    </div>
  ));
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

  return (
    <Sheet open={isSheetOpen} modal={false}>
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
                {renderFormattedItems(
                  granteeSplitFormated,
                  handleEdit,
                  handleRevert
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
                {renderFormattedItems(
                  grantorSplitFormated,
                  handleEdit,
                  handleRevert
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
