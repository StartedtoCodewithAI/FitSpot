import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AvatarUpload() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file')
      return
    }
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      setMessage('You must be logged in')
      return
    }
    const filename = `${userData.user.id}/${file.name}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filename, file, { upsert: true })
    if (error) {
      setMessage(`Upload failed: ${error.message}`)
      return
    }
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)
    setAvatarUrl(publicUrlData.publicUrl)
    setMessage('Avatar uploaded!')
  }

  return (
    <div>
      <h2>Upload Avatar</h2>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload}>Upload</button>
      {avatarUrl && <img src={avatarUrl} alt="Avatar" width={100} />}
      <div>{message}</div>
    </div>
  )
}
