'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Bell, 
  Settings, 
  User, 
  MessageSquare, 
  Heart,
  Star,
  ThumbsUp,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  PlayCircle,
  PauseCircle
} from 'lucide-react'
import { toast } from 'sonner'

export function VoiceTestComponents() {
  const [isNotificationsOn, setIsNotificationsOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [selectedColor, setSelectedColor] = useState('')
  const [message, setMessage] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [likeCount, setLikeCount] = useState(42)
  const [rating, setRating] = useState(0)

  const handleNotificationToggle = () => {
    const newState = !isNotificationsOn
    setIsNotificationsOn(newState)
    toast.success(`Notifications ${newState ? 'enabled' : 'disabled'}`)
  }

  const handleMuteToggle = () => {
    const newState = !isMuted
    setIsMuted(newState)
    toast.info(`Audio ${newState ? 'muted' : 'unmuted'}`)
  }

  const handlePlayPause = () => {
    const newState = !isPlaying
    setIsPlaying(newState)
    toast.info(newState ? 'Playing' : 'Paused')
  }

  const handleVisibilityToggle = () => {
    const newState = !isVisible
    setIsVisible(newState)
    toast.info(newState ? 'Content shown' : 'Content hidden')
  }

  const handleLike = () => {
    setLikeCount(prev => prev + 1)
    toast.success('Liked!')
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    toast.success(`Selected ${color} color`)
  }

  const handleRating = (stars: number) => {
    setRating(stars)
    toast.success(`Rated ${stars} stars`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card 
        data-voice="toggle notifications"
        data-voice-intents="notifications, toggle notifications, enable notifications, disable notifications"
        data-voice-action="toggle"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            Notifications
          </CardTitle>
          <CardDescription className="text-sm">
            Control your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-sm">
              Enable notifications
            </Label>
            <Switch 
              id="notifications"
              checked={isNotificationsOn}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
          <Alert>
            <AlertDescription>
              Status: {isNotificationsOn ? 'Active' : 'Inactive'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card 
        data-voice="mute audio"
        data-voice-intents="mute, unmute, mute audio, unmute audio, toggle mute"
        data-voice-action="toggle"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            Audio Control
          </CardTitle>
          <CardDescription className="text-sm">
            Manage audio settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Button 
            onClick={handleMuteToggle} 
            variant={isMuted ? "destructive" : "default"}
            className="w-full"
          >
            {isMuted ? 'Unmute' : 'Mute'} Audio
          </Button>
        </CardContent>
      </Card>

      <Card 
        data-voice="play music"
        data-voice-intents="play, pause, play music, pause music, start playing, stop playing"
        data-voice-action="toggle"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {isPlaying ? <PauseCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            Media Player
          </CardTitle>
          <CardDescription className="text-sm">
            Control media playback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Button 
            onClick={handlePlayPause} 
            variant={isPlaying ? "secondary" : "default"}
            className="w-full"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </CardContent>
      </Card>

      <Card 
        data-voice="hide content"
        data-voice-intents="hide, show, hide content, show content, toggle visibility"
        data-voice-action="toggle"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {isVisible ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            Content Visibility
          </CardTitle>
          <CardDescription className="text-sm">
            Toggle content visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Button 
            onClick={handleVisibilityToggle} 
            variant="outline"
            className="w-full"
          >
            {isVisible ? 'Hide' : 'Show'} Content
          </Button>
          {isVisible && (
            <Alert>
              <AlertDescription>
                This content can be hidden with voice commands!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card 
        data-voice="like this"
        data-voice-intents="like, like this, thumbs up, give a like"
        data-voice-action="click"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            Like Counter
          </CardTitle>
          <CardDescription className="text-sm">
            Show some love with voice commands
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{likeCount}</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </div>
          <Button 
            onClick={handleLike} 
            variant="outline"
            className="w-full"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Like This
          </Button>
        </CardContent>
      </Card>

      <Card 
        data-voice="select red color"
        data-voice-intents="select color, choose color, red color, blue color, green color"
        data-voice-action="select"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Color Selector
          </CardTitle>
          <CardDescription className="text-sm">
            Choose colors with voice commands
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Select onValueChange={handleColorSelect} value={selectedColor}>
            <SelectTrigger>
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="yellow">Yellow</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
            </SelectContent>
          </Select>
          {selectedColor && (
            <div className="text-center p-4 rounded-lg bg-muted">
              Selected: <span className="font-semibold capitalize">{selectedColor}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card 
        data-voice="write a message"
        data-voice-intents="write message, type message, send message, compose message"
        data-voice-action="focus"
        className="hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-2"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Message Composer
          </CardTitle>
          <CardDescription className="text-sm">
            Write and send messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your message</Label>
            <Textarea 
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              if (message.trim()) {
                toast.success('Message sent!')
                setMessage('')
              } else {
                toast.error('Please write a message first')
              }
            }}
            className="w-full"
          >
            Send Message
          </Button>
        </CardContent>
      </Card>

      <Card 
        data-voice="rate five stars"
        data-voice-intents="rate, rating, five stars, four stars, three stars, give rating"
        data-voice-action="rate"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
            Star Rating
          </CardTitle>
          <CardDescription className="text-sm">
            Rate with voice commands
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="focus:outline-none p-1"
              >
                <Star 
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    star <= rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              You rated {rating} star{rating > 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      <Card 
        data-voice="open profile"
        data-voice-intents="profile, user profile, open profile, show profile"
        data-voice-action="click"
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            User Profile
          </CardTitle>
          <CardDescription className="text-sm">
            Access user information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Button 
            onClick={() => setShowDialog(true)}
            variant="outline"
            className="w-full"
          >
            Open Profile
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Welcome to your profile! This dialog was opened using voice commands.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 