
import React from 'react'
export default function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { className='', ...rest } = props
  return <label className={['label', className].join(' ')} {...rest} />
}
