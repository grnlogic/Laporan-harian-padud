"use client"

import * as React from "react"
import { EnhancedButton } from "./enhanced-button"
import { EnhancedCard } from "./enhanced-card"
import { EnhancedInput, SearchInput } from "./enhanced-input"
import { EnhancedBadge, StatusBadge } from "./enhanced-badge"
import { EnhancedAlert } from "./enhanced-alert"
import { EnhancedTooltip } from "./enhanced-tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./enhanced-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Heart, Star, Download, Settings, User, Mail, Phone, ChevronDown, Sparkles, Zap, Crown } from "lucide-react"

export function DemoShowcase() {
  const [inputValue, setInputValue] = React.useState("")
  const [searchValue, setSearchValue] = React.useState("")

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Enhanced UI Components
        </h1>
        <p className="text-gray-600 text-lg">
          Beautiful, accessible, and highly customizable components built with Radix UI and Tailwind CSS
        </p>
      </div>

      {/* Enhanced Buttons */}
      <EnhancedCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold mb-4">Enhanced Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Variants</h3>
            <EnhancedButton>Default</EnhancedButton>
            <EnhancedButton variant="gradient">Gradient</EnhancedButton>
            <EnhancedButton variant="success" leftIcon={<Heart className="h-4 w-4" />}>
              Success
            </EnhancedButton>
            <EnhancedButton variant="premium" animation="glow">
              Premium
            </EnhancedButton>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Sizes</h3>
            <EnhancedButton size="sm">Small</EnhancedButton>
            <EnhancedButton size="default">Default</EnhancedButton>
            <EnhancedButton size="lg">Large</EnhancedButton>
            <EnhancedButton size="xl" rightIcon={<Star className="h-4 w-4" />}>
              Extra Large
            </EnhancedButton>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">States</h3>
            <EnhancedButton loading>Loading</EnhancedButton>
            <EnhancedButton disabled>Disabled</EnhancedButton>
            <EnhancedButton variant="outline" animation="bounce">
              Animated
            </EnhancedButton>
            <EnhancedButton variant="destructive" leftIcon={<Download className="h-4 w-4" />}>
              Download
            </EnhancedButton>
          </div>
        </div>
      </EnhancedCard>

      {/* Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedCard variant="default" animation="hover">
          <div className="p-6">
            <h3 className="font-semibold mb-2">Default Card</h3>
            <p className="text-gray-600">Basic card with hover animation</p>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="gradient" animation="float">
          <div className="p-6">
            <h3 className="font-semibold mb-2">Gradient Card</h3>
            <p className="text-gray-600">Beautiful gradient background</p>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="glass" animation="glow">
          <div className="p-6">
            <h3 className="font-semibold mb-2">Glass Card</h3>
            <p className="text-gray-600">Modern glassmorphism effect</p>
          </div>
        </EnhancedCard>
      </div>

      {/* Enhanced Inputs */}
      <EnhancedCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold mb-4">Enhanced Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <EnhancedInput
              label="Default Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              clearable
              onClear={() => setInputValue("")}
            />

            <EnhancedInput
              variant="filled"
              label="Filled Input"
              placeholder="Filled variant"
              leftIcon={<User className="h-4 w-4" />}
            />

            <EnhancedInput
              variant="outlined"
              label="Email"
              type="email"
              placeholder="your@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
              helperText="We'll never share your email"
            />
          </div>

          <div className="space-y-4">
            <EnhancedInput type="password" label="Password" placeholder="Enter password" />

            <SearchInput
              placeholder="Search anything..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue("")}
            />

            <EnhancedInput
              variant="underlined"
              label="Phone"
              placeholder="+1 (555) 123-4567"
              leftIcon={<Phone className="h-4 w-4" />}
              state="success"
            />
          </div>
        </div>
      </EnhancedCard>

      {/* Enhanced Badges */}
      <EnhancedCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold mb-4">Enhanced Badges</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <EnhancedBadge>Default</EnhancedBadge>
            <EnhancedBadge variant="success" icon={<Heart className="h-3 w-3" />}>
              Success
            </EnhancedBadge>
            <EnhancedBadge variant="warning">Warning</EnhancedBadge>
            <EnhancedBadge variant="gradient" animation="pulse">
              Gradient
            </EnhancedBadge>
            <EnhancedBadge variant="neon" icon={<Zap className="h-3 w-3" />}>
              Neon
            </EnhancedBadge>
            <EnhancedBadge variant="glass">Glass</EnhancedBadge>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status="online" />
            <StatusBadge status="busy" />
            <StatusBadge status="away" />
            <StatusBadge status="completed" />
            <StatusBadge status="pending" />
            <StatusBadge status="failed" />
          </div>
        </div>
      </EnhancedCard>

      {/* Enhanced Alerts */}
      <div className="space-y-4">
        <EnhancedAlert variant="info" dismissible>
          <div>
            <h4 className="font-semibold">Information</h4>
            <p>This is an informational alert with dismiss functionality.</p>
          </div>
        </EnhancedAlert>

        <EnhancedAlert variant="success" autoClose={5000}>
          <div>
            <h4 className="font-semibold">Success!</h4>
            <p>Your action was completed successfully. This alert will auto-close in 5 seconds.</p>
          </div>
        </EnhancedAlert>

        <EnhancedAlert variant="gradient" icon={<Sparkles className="h-4 w-4" />}>
          <div>
            <h4 className="font-semibold">Premium Feature</h4>
            <p>Unlock advanced features with our premium plan.</p>
          </div>
        </EnhancedAlert>
      </div>

      {/* Interactive Components */}
      <EnhancedCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold mb-4">Interactive Components</h2>
        <div className="flex flex-wrap gap-4">
          {/* Enhanced Tooltip */}
          <EnhancedTooltip content="This is a beautiful tooltip!" variant="gradient">
            <EnhancedButton variant="outline">Hover for Tooltip</EnhancedButton>
          </EnhancedTooltip>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EnhancedButton variant="outline" rightIcon={<ChevronDown className="h-4 w-4" />}>
                Dropdown Menu
              </EnhancedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Enhanced Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <EnhancedButton variant="gradient">Open Dialog</EnhancedButton>
            </DialogTrigger>
            <DialogContent variant="card" size="lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Premium Dialog
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>This is a beautiful enhanced dialog with custom styling.</p>
                <div className="grid grid-cols-2 gap-4">
                  <EnhancedInput placeholder="First name" />
                  <EnhancedInput placeholder="Last name" />
                </div>
                <EnhancedInput placeholder="Email address" leftIcon={<Mail className="h-4 w-4" />} />
                <div className="flex justify-end gap-2">
                  <EnhancedButton variant="outline">Cancel</EnhancedButton>
                  <EnhancedButton variant="gradient">Save Changes</EnhancedButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </EnhancedCard>
    </div>
  )
}
