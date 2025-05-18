import { Loader2, User, FileText, BarChart, Calendar } from "lucide-react"

interface IconProps {
  className?: string
  size?: number
}

export const Icons = {
  spinner: Loader2,
  Users: User,
  FileText: FileText,
  BarChart: BarChart,
  Calendar: Calendar,
  google: (props: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path
        fill="currentColor"
        d="M12.545 12.151c0 .866-.693 1.55-1.549 1.55-.856 0-1.549-.684-1.549-1.55 0-.866.693-1.55 1.549-1.55.856 0 1.549.684 1.549 1.55zm.339-4.895v1.798h2.996c.12.788-.082 1.959-.693 2.728-.625.77-1.596 1.22-2.782 1.22-2.223 0-4.115-1.833-4.115-4.143s1.892-4.143 4.115-4.143c1.206 0 2.058.463 2.702 1.067l1.272-1.282c-.896-.839-2.087-1.502-3.974-1.502-3.195 0-5.886 2.628-5.886 5.86s2.691 5.86 5.886 5.86c1.726 0 3.022-.57 4.038-1.647 1.043-1.058 1.369-2.55 1.369-3.752 0-.37-.033-.713-.098-1.003h-5.309v-.061z"
      />
    </svg>
  ),
}
