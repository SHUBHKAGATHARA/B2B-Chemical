"use client";

import { WarningGraphic } from "@/components/ui/warning-graphic";

export default function WarningGraphicDemo() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800">
            <div className="text-center space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Warning Graphic Component
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Animated SVG warning indicator with customizable properties
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-800 p-12 rounded-2xl shadow-premium">
                    <WarningGraphic
                        width={600}
                        height={230}
                        enableAnimations={true}
                        animationSpeed={1.5}
                        className="drop-shadow-lg"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-glass">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Default Yellow
                        </h3>
                        <WarningGraphic
                            width={200}
                            height={80}
                            enableAnimations={true}
                            animationSpeed={2}
                        />
                    </div>

                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-glass">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Custom Red
                        </h3>
                        <WarningGraphic
                            width={200}
                            height={80}
                            color="#EF4444"
                            enableAnimations={true}
                            animationSpeed={2}
                        />
                    </div>

                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-glass">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Custom Green
                        </h3>
                        <WarningGraphic
                            width={200}
                            height={80}
                            color="#10B981"
                            enableAnimations={true}
                            animationSpeed={2}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
