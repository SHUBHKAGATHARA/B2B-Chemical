import { SidebarDemo } from "@/components/ui/sidebar-demo";

export default function SidebarTestPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-4">
            <div className="mb-4 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Sidebar Component Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Hover over the sidebar on desktop or click the menu icon on mobile
                </p>
            </div>
            <SidebarDemo />
        </div>
    );
}
