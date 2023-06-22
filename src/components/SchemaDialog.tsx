import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Typography,
} from "@material-tailwind/react";
import { Fragment, useState } from "react";
import { tables } from "../../utils/tables";
import { DatabaseSchema } from "./DataBaseSchema";

export default function SchemaDialog() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);
  const handleClose = () => setOpen(false);

  return (
    <Fragment>
      <Button onClick={handleOpen} className="font-normal text-[#999] text-sm ">
        Schema
      </Button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-2xl backdrop-opacity-50 ">
          <Dialog
            open={open}
            handler={handleClose}
            className="m-auto absolute inset-0 bg-[#888] max-w-2xl mx-auto rounded-lg scrollbar-thin shadow max-h-[60vh] flex flex-col overflow-y-scroll space-y-1 "
          >
            <DialogHeader className="py-4 text-black mx-4">Database Schema</DialogHeader>
            <DialogBody divider className=" overflow-y-auto py-4 my-4 text-black scrollbar-thin overflow-x-auto text-sm mx-4">
              <DatabaseSchema tables={tables} />
            </DialogBody>
          </Dialog>
        </div>
      )}
    </Fragment>
  );
}