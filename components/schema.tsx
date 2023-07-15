'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import React, { useState } from 'react'

type Column = {
  name: string
  type: string
  constraints: string
}

type Table = {
  name: string
  description: string
  columns: Column[]
}

type SchemaViewerProps = {
  tables: Table[]
}

type ExpandableSectionProps = {
  title: string
  children: React.ReactNode
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-4">
      <button
        className="mb-2 text-xs font-semibold md:text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      {isOpen && <div className="pl-4">{children}</div>}
    </div>
  )
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ tables }) => {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">View Schema</Button>
        </DialogTrigger>
        <DialogContent>
          <div className="max-h-screen overflow-auto p-2">
            {tables.map((table, index) => (
              <ExpandableSection key={index} title={table.name}>
                {table.columns.map((column, columnIdx) => (
                  <div key={column.name} className="mb-2 break-words">
                    <strong className="md:text-md p-1 text-xs">
                      {column.name}
                    </strong>
                    <i className="text-xs">Type: {column.type}</i>
                    <p className="text-xs md:text-sm">
                      Constraints: {column.constraints}
                    </p>
                  </div>
                ))}
              </ExpandableSection>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
