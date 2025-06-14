import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AvatarUpload() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setMessage('')
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file')
      return
    }
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      setMessage('You must be logged in')
      setLoading(false)
      return
    }
    const filename = `${userData.user.id}/${file.name}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filename, file, { upsert: true })
    if (error) {
      setMessage(`Upload failed: ${error.message}`)
      setLoading(false)
      return
    }
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)
    setAvatarUrl(publicUrlData.publicUrl)
    setMessage('Avatar uploaded!')
    setLoading(false)
  }

  return (
    <div>
      <h2>Upload Avatar</h2>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {avatarUrl && <img src={avatarUrl} alt="Avatar" width={100} />}
      <div>{message}</div>
    </div>
  )
}
