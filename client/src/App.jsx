import React, { useEffect, useState, useRef } from 'react'
import './styles.css'

const API = '/api'

function Sidebar({playlists, onCreate, onSelect}){
  const name = useRef('')
  return (
    <aside className="sidebar">
      <h3>u music</h3>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={()=>{ const n = prompt('Playlist name'); if(n) onCreate(n); }}>New Playlist</button>
      </div>
      <div style={{marginTop:16}}>
        <h4 style={{margin:'6px 0', color:'var(--muted)'}}>Playlists</h4>
        {playlists.map(p => (
          <div key={p._id} className="playlist-item" onClick={()=>onSelect(p)}>{p.name}</div>
        ))}
      </div>
    </aside>
  )
}

function TrackCard({t, onPlay, onAdd}){
  return (
    <div className="track">
      <div className="meta">{t.title}</div>
      <div style={{marginTop:8, color:'var(--muted)'}}>{t.artist}</div>
      <div style={{marginTop:12, display:'flex',gap:8}}>
        <button className="btn" onClick={()=>onPlay(t)}>Play</button>
        <button className="btn" onClick={()=>onAdd(t)}>Add</button>
      </div>
    </div>
  )
}

function Player({src, track, onNext, onPrev}){
  const audioRef = useRef()
  useEffect(()=>{ if(src && audioRef.current){ audioRef.current.load(); audioRef.current.play().catch(()=>{}); } },[src])
  return (
    <div className="player">
      <div style={{flex:1}}>
        <div style={{fontWeight:700}}>{track?.title || 'Nothing playing'}</div>
        <div style={{color:'var(--muted)'}}>{track?.artist || ''}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="btn" onClick={onPrev}>Prev</button>
        <button className="btn" onClick={()=>{ if(audioRef.current.paused) audioRef.current.play(); else audioRef.current.pause(); }}>Play/Pause</button>
        <button className="btn" onClick={onNext}>Next</button>
      </div>
      <audio ref={audioRef} style={{width:320}} controls>
        <source src={src} />
      </audio>
    </div>
  )
}

function App(){
  const [token,setToken] = useState(localStorage.getItem('token'))
  const [tracks,setTracks] = useState([])
  const [playlists,setPlaylists] = useState([])
  const [q,setQ] = useState('')
  const [queue,setQueue] = useState([])
  const [current,setCurrent] = useState(null)
  const [playingSrc,setPlayingSrc] = useState(null)

  useEffect(()=>{ load(); loadPlaylists(); },[])

  async function load(qstr=''){
    const res = await fetch(API + '/tracks' + (qstr? '?q='+encodeURIComponent(qstr): ''))
    setTracks(await res.json())
  }

  async function loadPlaylists(){
    if(!token) return;
    const res = await fetch(API + '/playlists', { headers: { Authorization: 'Bearer ' + token } });
    if(res.ok) setPlaylists(await res.json());
  }

  async function signup(){
    const email = prompt('email');
    const password = prompt('password');
    const res = await fetch(API + '/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) })
    const data = await res.json(); if (data.token){ setToken(data.token); localStorage.setItem('token', data.token); alert('Signed up'); loadPlaylists(); }
  }

  async function login(){
    const email = prompt('email');
    const password = prompt('password');
    const res = await fetch(API + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) })
    const data = await res.json(); if (data.token){ setToken(data.token); localStorage.setItem('token', data.token); alert('Logged in'); loadPlaylists(); }
  }

  async function upload(){
    if(!token) return alert('Login first');
    const file = await new Promise(r=>{ const i = document.createElement('input'); i.type='file'; i.accept='audio/*'; i.onchange=e=>r(e.target.files[0]); i.click(); })
    if(!file) return
    const form = new FormData(); form.append('file', file); form.append('title', file.name);
    const res = await fetch(API + '/tracks/upload', { method:'POST', headers: { Authorization: 'Bearer ' + token }, body: form })
    const data = await res.json(); if (data._id) { alert('Uploaded'); load(); } else alert(JSON.stringify(data))
  }

  function playTrack(t){
    setCurrent(t);
    setPlayingSrc(API + '/tracks/' + t._id + '/stream');
  }

  function addToQueue(t){ setQueue(q => [...q, t]); }

  async function createPlaylist(name){
    if(!token) return alert('Login first');
    const res = await fetch(API + '/playlists', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, body:JSON.stringify({name}) });
    if(res.ok) loadPlaylists();
  }

  async function addTrackToPlaylist(track){
    if(!token) return alert('Login first');
    const pl = playlists[0]; if(!pl) return alert('Create a playlist first');
    await fetch(API + `/playlists/${pl._id}/add`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, body:JSON.stringify({ trackId: track._id }) });
    alert('Added to playlist: ' + pl.name);
  }

  return (
    <div className="app">
      <header>
        <h1>u music</h1>
        <div>
          {token ? <button className="btn" onClick={()=>{setToken(null);localStorage.removeItem('token')}}>Logout</button> : <><button className="btn" onClick={signup}>Sign up</button><button className="btn" onClick={login}>Log in</button></>}
        </div>
      </header>

      <main>
        <Sidebar playlists={playlists} onCreate={createPlaylist} onSelect={(p)=>alert('Open playlist: '+p.name)} />
        <div className="content">
          <div className="controls">
            <button className="btn primary" onClick={upload} disabled={!token}>Upload</button>
            <input placeholder="search" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,padding:8,borderRadius:6,border:'none'}} />
            <button className="btn" onClick={()=>load(q)}>Search</button>
          </div>

          <section className="tracks">
            {tracks.map(t => <TrackCard key={t._id} t={t} onPlay={playTrack} onAdd={addTrackToPlaylist} />)}
          </section>
        </div>
      </main>

      <Player src={playingSrc} track={current} onNext={()=>{ const [n,...rest]=queue; if(n){ playTrack(n); setQueue(rest); } }} onPrev={()=>{ alert('prev not implemented') }} />
    </div>
  )
}

export default App
