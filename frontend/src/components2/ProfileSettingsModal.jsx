import React, { useEffect, useMemo, useState } from "react"
import * as Tabs from "@radix-ui/react-tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components2/ui/dialog"
import { Button } from "@/components2/ui/button"
import { Input } from "@/components2/ui/input"
import { updateProfile, getMe } from "@/services/auth"
import { uploadToCloudinary } from "@/utils/uploadToCloudinary"

export default function ProfileSettingsModal({ open, onClose }) {
  const [profile, setProfile] = useState({
    profile_image_url: "",
    bio: "",
    language: "en",
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    getMe().then((res) => {
      setProfile({
        profile_image_url: res.profile_image_url || "",
        bio: res.bio || "",
        language: res.language || "en",
      })
    })
  }, [open])

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return profile.profile_image_url
  }, [file, profile.profile_image_url])

  useEffect(() => {
    return () => {
      if (file && previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [file, previewUrl])

  const handleChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value })
  }

  const handleFileChange = (e) => {
    const image = e.target.files?.[0]
    if (image) setFile(image)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = profile.profile_image_url
      if (file) imageUrl = await uploadToCloudinary(file)

      await updateProfile({ ...profile, profile_image_url: imageUrl })
      onClose()
    } catch (err) {
      alert("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const clearCache = () => {
    // safer than nuking everything (keeps logged-in token optional if you want)
    localStorage.removeItem("module-drafts")
    sessionStorage.clear()
    alert("🧹 Cache cleared!")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EA7125]/40 to-transparent" />

        <DialogHeader className="px-6 pt-6 pb-4 bg-white/70 backdrop-blur-xl border-b border-white/10">
          <DialogTitle className="text-lg font-bold text-[#2C365E] flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#EA7125] shadow-[0_0_0_5px_rgba(234,113,37,0.15)]" />
            Profile & Settings
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 bg-white/45 backdrop-blur-xl">
          <Tabs.Root defaultValue="profile" className="w-full">
            <Tabs.List className="grid grid-cols-2 rounded-2xl border border-white/15 bg-white/55 backdrop-blur-xl p-1 mb-5">
              <Tabs.Trigger
                value="profile"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#2C365E]/70 data-[state=active]:bg-white/70 data-[state=active]:text-[#2C365E] transition"
              >
                👤 Profile
              </Tabs.Trigger>
              <Tabs.Trigger
                value="settings"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#2C365E]/70 data-[state=active]:bg-white/70 data-[state=active]:text-[#2C365E] transition"
              >
                ⚙️ Settings
              </Tabs.Trigger>
            </Tabs.List>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs.Content value="profile" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2C365E]">
                    Profile Image
                  </label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                  {previewUrl && (
                    <div className="pt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border border-white/20 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2C365E]">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-2xl border border-white/15 bg-white/60 p-3 text-sm outline-none backdrop-blur
                      focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                    rows={4}
                    value={profile.bio}
                    onChange={handleChange("bio")}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </Tabs.Content>

              <Tabs.Content value="settings" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2C365E]">
                    Language
                  </label>
                  <select
                    className="w-full rounded-2xl border border-white/15 bg-white/60 p-3 text-sm outline-none backdrop-blur
                      focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                    value={profile.language}
                    onChange={handleChange("language")}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="ht">Kreyòl Ayisyen</option>
                  </select>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={clearCache}
                  className="rounded-xl bg-red-500/12 text-red-600 hover:bg-red-500/16 border border-red-500/15"
                >
                  🧹 Clear Cache
                </Button>
              </Tabs.Content>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full rounded-xl text-white"
                  disabled={loading}
                  style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Tabs.Root>
        </div>
      </DialogContent>
    </Dialog>
  )
}
