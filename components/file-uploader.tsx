"use client"

import type React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface FileUploaderProps {
  onUpload: (files: File[]) => void
  maxSize: number
  acceptedFileTypes: string[]
  multiple: boolean
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, maxSize, acceptedFileTypes, multiple }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles)
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedFileTypes.join(","),
    multiple,
  })

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      {isDragActive ? <p>أفلت الملفات هنا ...</p> : <p>اسحب وأفلت بعض الملفات هنا، أو انقر لتحديد الملفات</p>}
    </div>
  )
}
