import { cn } from '@/lib/utils'
import { tables } from '@/utils/tables'
import { SchemaViewer } from './schema'

export function SidebarFooter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <>
      <div
        className={cn('flex items-center justify-center border-b-2', className)}
      >
        <SchemaViewer tables={tables} />
      </div>
      <div
        className={cn('flex items-center justify-between p-4', className)}
        {...props}
      >
        {children}
      </div>
    </>
  )
}
