<template>

  <UserDashoardLayout>

    <template #main>

      <div class="min-h-screen bg-[#09090b] font-google-sans text-white p-4 sm:p-8 pt-28!">
        <!-- Header -->
        <div class="max-w-6xl mx-auto mb-10">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🧪</span>
            <div>
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight">Security Rules <span
                  class="text-orange-500">Test
                  Lab</span></h1>
              <p class="text-white/40 text-sm mt-1">Firestore security rules playground — each button tests a specific
                rule
                path</p>
            </div>
          </div>
          <div class="flex gap-2 mt-4 flex-wrap">
            <span
              class="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase">🔴
              Admin</span>
            <span
              class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase">🔵
              User</span>
            <span
              class="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[10px] font-black uppercase">⚪
              Public</span>
          </div>
        </div>

        <div class="max-w-6xl mx-auto space-y-10">

          <!-- ════════════════════════════════════════════ -->
          <!-- 🔐 AUTH SECTION -->
          <!-- ════════════════════════════════════════════ -->
          <section>
            <div class="flex items-center gap-2 mb-4">
              <span
                class="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">🔐
                Auth</span>
              <div class="h-px flex-1 bg-white/5"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button @click="testLogin" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Login Email</span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">signInWithEmailAndPassword</span>
              </button>
              <button @click="testGoogleLogin" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Login Google</span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">signInWithPopup(Google)</span>
              </button>
              <button @click="testLogout" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Logout</span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">signOut()</span>
              </button>
              <button @click="testForgotPassword" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Forgot Password</span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">sendPasswordResetEmail</span>
              </button>
              <button @click="testResendVerification" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Resend Verification</span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">sendEmailVerification</span>
              </button>
            </div>
          </section>

          <!-- ════════════════════════════════════════════ -->
          <!-- 👤 USER SECTION -->
          <!-- ════════════════════════════════════════════ -->
          <section>
            <div class="flex items-center gap-2 mb-4">
              <span
                class="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">👤
                User Operations</span>
              <div class="h-px flex-1 bg-white/5"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              <!-- READ own user doc -->
              <button @click="testReadOwnUser" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Read My Profile</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}</span>
              </button>

              <!-- UPDATE own phone -->
              <button @click="testUpdateOwnPhone" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Update My Phone</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">UPDATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid} (phone)</span>
              </button>

              <!-- READ own subscriptions -->
              <button @click="testReadOwnSubs" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Read My Subs</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/subscriptions</span>
              </button>

              <!-- READ own QRs -->
              <button @click="testReadOwnQRs" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Read My QRs</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/qrs</span>
              </button>

              <!-- CREATE QR (own uid) -->
              <button @click="testCreateOwnQR" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Create QR (own)</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/qrs + /publicQR</span>
              </button>

              <!-- UPDATE own QR -->
              <button @click="testUpdateOwnQR" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Update My QR</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">UPDATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/qrs/{id} (name,status)</span>
              </button>

              <!-- READ publicQR -->
              <button @click="testReadPublicQR" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Read publicQR</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id}</span>
              </button>

              <!-- UPDATE own publicQR -->
              <button @click="testUpdateOwnPublicQR" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Update My publicQR</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">UPDATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id} (name,status)</span>
              </button>

              <!-- Request physical shipment -->
              <button @click="testRequestPhysical" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Request Shipment</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">UPDATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/qrs/{id} (physicalShipped)</span>
              </button>

              <!-- Create scan log (auth) -->
              <button @click="testCreateScanLog" class="action-card border-blue-500/20 hover:border-blue-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-blue-400 text-xs font-black uppercase tracking-wider">Create Scan Log</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id}/logs</span>
              </button>
            </div>
          </section>

          <!-- ════════════════════════════════════════════ -->
          <!-- 🔴 ADMIN SECTION -->
          <!-- ════════════════════════════════════════════ -->
          <section>
            <div class="flex items-center gap-2 mb-4">
              <span
                class="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-widest">🔴
                Admin Operations</span>
              <div class="h-px flex-1 bg-white/5"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              <!-- Read all users -->
              <button @click="testReadAllUsers" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Read All Users</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/10 text-red-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users (collection)</span>
              </button>

              <!-- Read all subscriptions (collectionGroup) -->
              <button @click="testReadAllSubs" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Read All Subscriptions</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/10 text-red-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">collectionGroup subscriptions</span>
              </button>

              <!-- Read all scan logs -->
              <button @click="testReadAllLogs" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Read All Scan Logs</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/10 text-red-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id}/logs</span>
              </button>

              <!-- Ban user -->
              <button @click="testBanUser" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Ban / Unban User</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">UPDATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid} (isBanned)</span>
              </button>

              <!-- Create subscription -->
              <button @click="testCreateSub" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Create Subscription</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/subscriptions</span>
              </button>

              <!-- Cancel subscription -->
              <button @click="testCancelSub" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Cancel Subscription</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">UPDATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/subscriptions/{id} (status)</span>
              </button>

              <!-- Renew subscription -->
              <button @click="testRenewSub" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Renew Subscription</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/subscriptions (new)</span>
              </button>

              <!-- Assign trial -->
              <button @click="testAssignTrial" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Assign Free Trial</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/subscriptions (trial)</span>
              </button>

              <!-- Create user document -->
              <button @click="testCreateUser" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Create User Doc</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}</span>
              </button>

              <!-- Update user (any field) -->
              <button @click="testUpdateUserAny" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Update User (any)</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">UPDATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid} (any field)</span>
              </button>

              <!-- Delete user -->
              <button @click="testDeleteUser" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Delete User</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/10 text-red-400">DELETE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}</span>
              </button>

              <!-- Create QR on behalf -->
              <button @click="testCreateQRAdmin" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Create QR for User</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/qrs (admin)</span>
              </button>

              <!-- Delete QR -->
              <button @click="testDeleteQR" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Delete QR</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/10 text-red-400">DELETE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/users/{uid}/qrs/{id}</span>
              </button>

              <!-- Delete scan log -->
              <button @click="testDeleteScanLog" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Delete Scan Log</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/10 text-red-400">DELETE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id}/logs/{logId}</span>
              </button>

              <!-- Delete publicQR -->
              <button @click="testDeletePublicQR" class="action-card border-red-500/20 hover:border-red-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-red-400 text-xs font-black uppercase tracking-wider">Delete publicQR</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/10 text-red-400">DELETE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id}</span>
              </button>
            </div>
          </section>

          <!-- ════════════════════════════════════════════ -->
          <!-- 🌐 PUBLIC / UNAUTHENTICATED SECTION -->
          <!-- ════════════════════════════════════════════ -->
          <section>
            <div class="flex items-center gap-2 mb-4">
              <span
                class="px-3 py-1 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[10px] font-black uppercase tracking-widest">🌐
                Public (unauthenticated)</span>
              <div class="h-px flex-1 bg-white/5"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button @click="testPublicReadPublicQR" class="action-card border-gray-500/20 hover:border-gray-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-gray-400 text-xs font-black uppercase tracking-wider">Read publicQR</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-gray-500/10 text-gray-400">READ</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id} (allow read: if true)</span>
              </button>
              <button @click="testPublicCreateScanLog" class="action-card border-gray-500/20 hover:border-gray-500/40">
                <span class="flex items-center gap-2">
                  <span class="text-gray-400 text-xs font-black uppercase tracking-wider">Create Scan Log</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">CREATE</span>
                </span>
                <span class="text-white/30 text-[10px] font-mono mt-0.5">/publicQR/{id}/logs (anonymous)</span>
              </button>
            </div>
          </section>

          <!-- Log output -->
          <section class="pb-20">
            <div class="flex items-center gap-2 mb-4">
              <span
                class="px-3 py-1 rounded-lg bg-white/5 text-white/50 border border-white/10 text-[10px] font-black uppercase tracking-widest">📋
                Console Output</span>
              <div class="h-px flex-1 bg-white/5"></div>
              <button @click="clearLogs"
                class="text-white/30 hover:text-white text-[10px] font-mono transition-colors">clear</button>
            </div>
            <div
              class="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto space-y-1">
              <div v-if="logs.length === 0" class="text-white/20 italic">No operations executed yet. Click any button
                above.
              </div>
              <div v-for="(log, i) in logs" :key="i" class="flex gap-2">
                <span class="text-white/20 shrink-0">{{ String(i + 1).padStart(2, '0') }}</span>
                <span :class="log.color" class="whitespace-pre-wrap break-all">{{ log.text }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>

  </UserDashoardLayout>

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { auth, db } from '@/firebase'
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  getDocs,
  collection,
  collectionGroup,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { useUserStore } from '@/stores/user'
import UserDashoardLayout from '@/layouts/UserDashoardLayout.vue'

const userStore = useUserStore()

// ─── Logging ────────────────────────────────────────────────
interface LogEntry {
  text: string
  color: string
}
const logs = ref<LogEntry[]>([])

const addLog = (text: string, color = 'text-white/80') => {
  logs.value.push({ text, color })
  console.log(`[SecurityTest] ${text}`)
}

const clearLogs = () => {
  logs.value = []
}

// ─── Helpers ────────────────────────────────────────────────
const userId = () => userStore.getUserId || 'not-authenticated'
const isAuth = () => !!userStore.getUserId

const testLabel = (section: string, operation: string, path: string) => {
  const msg = `[${section}] ${operation} — ${path}`
  addLog(`▶ ${msg}`, 'text-cyan-400')
  toast.info(operation)
  return msg
}

const testOk = (label: string, data?: unknown) => {
  const msg = data ? `${label} ✅ (see console for details)` : `${label} ✅`
  addLog(`  ✓ ${msg}`, 'text-emerald-400')
  toast.success(label)
  console.log('[SecurityTest] Response data:', data)
}

const testError = (label: string, error: unknown) => {
  const err = error as { code?: string; message?: string }
  const code = err?.code || 'unknown'
  const msg = err?.message || String(error)
  addLog(`  ✗ ${label} — [${code}] ${msg}`, 'text-red-400')
  toast.error(`${label}: ${code}`)
  console.error('[SecurityTest] Error:', error)
}

// ─── AUTH ───────────────────────────────────────────────────
const formEmail = ref('test@ubiqueme.com')
const formPassword = ref('Test123!')

const testLogin = async () => {
  const lbl = testLabel('AUTH', 'Login email/password', 'Firebase Auth')
  try {
    const cred = await signInWithEmailAndPassword(auth, formEmail.value, formPassword.value)
    testOk(lbl, { uid: cred.user.uid, email: cred.user.email })
  } catch (e) { testError(lbl, e) }
}

const testGoogleLogin = async () => {
  const lbl = testLabel('AUTH', 'Login Google Popup', 'Firebase Auth')
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    testOk(lbl, { uid: result.user.uid, email: result.user.email })
  } catch (e) {
    const err = e as { code?: string }
    if (err.code !== 'auth/popup-closed-by-user') testError(lbl, e)
    else addLog('  ∼ Popup closed by user', 'text-yellow-400')
  }
}

const testLogout = async () => {
  const lbl = testLabel('AUTH', 'Logout', 'Firebase Auth')
  try {
    await signOut(auth)
    userStore.clearUser()
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

const testForgotPassword = async () => {
  const lbl = testLabel('AUTH', 'Forgot password', 'sendPasswordResetEmail')
  if (!formEmail.value) {
    addLog('  ∼ No email entered, skipping', 'text-yellow-400')
    return
  }
  try {
    await sendPasswordResetEmail(auth, formEmail.value)
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

const testResendVerification = async () => {
  const lbl = testLabel('AUTH', 'Resend verification', 'sendEmailVerification')
  if (!auth.currentUser) {
    addLog('  ∼ No user logged in, cannot resend', 'text-yellow-400')
    return
  }
  try {
    await sendEmailVerification(auth.currentUser)
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

// ─── USER OPS ───────────────────────────────────────────────
const testReadOwnUser = async () => {
  const uid = userId()
  const lbl = testLabel('USER', 'Read own profile', `/users/${uid}`)
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    testOk(lbl, snap.exists() ? snap.data() : 'not found')
  } catch (e) { testError(lbl, e) }
}

const testUpdateOwnPhone = async () => {
  const uid = userId()
  const lbl = testLabel('USER', 'Update phone', `/users/${uid} (phone)`)
  if (!isAuth()) { addLog('  ∼ Not authenticated', 'text-yellow-400'); return }
  try {
    await updateDoc(doc(db, 'users', uid), { phone: '+525551234567' })
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

const testReadOwnSubs = async () => {
  const uid = userId()
  const lbl = testLabel('USER', 'Read own subscriptions', `/users/${uid}/subscriptions`)
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'subscriptions'))
    testOk(lbl, snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { testError(lbl, e) }
}

const testReadOwnQRs = async () => {
  const uid = userId()
  const lbl = testLabel('USER', 'Read own QRs', `/users/${uid}/qrs`)
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'qrs'))
    testOk(lbl, snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { testError(lbl, e) }
}

const testCreateOwnQR = async () => {
  const uid = userId()
  const qrId = nanoid(15)
  const lbl = testLabel('USER', 'Create QR (own)', `/users/${uid}/qrs/${qrId} + /publicQR/${qrId}`)
  if (!isAuth()) { addLog('  ∼ Not authenticated', 'text-yellow-400'); return }
  try {
    const batch = writeBatch(db)
    batch.set(doc(db, 'users', uid, 'qrs', qrId), {
      id: qrId, uid, name: 'Test QR', status: 'Active', scans: 0, lastScan: '',
      isActive: true, isBanned: false, banReason: '', subscriptionId: 'test', createdAt: Timestamp.now(),
    })
    batch.set(doc(db, 'publicQR', qrId), {
      id: qrId, name: 'Test QR', status: 'Active', lastScan: null, totalScans: 0,
      isBanned: false, banReason: '', docId: qrId, uid, tier: 'free', isPublic: true,
      category: 'Test', createdAt: Timestamp.now(),
    })
    await batch.commit()
    testOk(lbl, { qrId })
  } catch (e) { testError(lbl, e) }
}

const testUpdateOwnQR = async () => {
  const uid = userId()
  const lbl = testLabel('USER', 'Update QR (own)', `/users/${uid}/qrs/{id} (name,status)`)
  if (!isAuth()) { addLog('  ∼ Not authenticated', 'text-yellow-400'); return }
  try {
    // Get first QR
    const snap = await getDocs(collection(db, 'users', uid, 'qrs'))
    if (snap.empty) { addLog('  ∼ No QRs to update', 'text-yellow-400'); return }
    const qrId = snap.docs[0]!.id
    await updateDoc(doc(db, 'users', uid, 'qrs', qrId), { name: 'Updated Test QR', status: 'Active' })
    testOk(lbl, { qrId })
  } catch (e) { testError(lbl, e) }
}

const testReadPublicQR = async () => {
  const lbl = testLabel('USER', 'Read publicQR', '/publicQR/{id}')
  try {
    const snap = await getDocs(collection(db, 'publicQR'))
    if (snap.empty) { addLog('  ∼ No publicQR docs', 'text-yellow-400'); return }
    testOk(lbl, snap.docs.slice(0, 3).map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { testError(lbl, e) }
}

const testUpdateOwnPublicQR = async () => {
  const uid = userId()
  const lbl = testLabel('USER', 'Update own publicQR', '/publicQR/{id} (name,status)')
  if (!isAuth()) { addLog('  ∼ Not authenticated', 'text-yellow-400'); return }
  try {
    const snap = await getDocs(collection(db, 'publicQR'))
    const own = snap.docs.find(d => d.data().uid === uid)
    if (!own) { addLog('  ∼ No own publicQR found', 'text-yellow-400'); return }
    await updateDoc(doc(db, 'publicQR', own.id), { name: 'Updated public QR', status: 'Active' })
    testOk(lbl, { qrId: own.id })
  } catch (e) { testError(lbl, e) }
}

const testRequestPhysical = async () => {
  const uid = userId()
  const lbl = testLabel('USER', 'Request physical shipment', `/users/${uid}/qrs/{id} (physicalShipped)`)
  if (!isAuth()) { addLog('  ∼ Not authenticated', 'text-yellow-400'); return }
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'qrs'))
    if (snap.empty) { addLog('  ∼ No QRs found', 'text-yellow-400'); return }
    const qrId = snap.docs[0]!.id
    await updateDoc(doc(db, 'users', uid, 'qrs', qrId), {
      physicalShipped: true,
      physicalShippedAt: Timestamp.now(),
    })
    testOk(lbl, { qrId })
  } catch (e) { testError(lbl, e) }
}

const testCreateScanLog = async () => {
  const lbl = testLabel('USER', 'Create scan log (auth)', '/publicQR/{id}/logs')
  try {
    const snap = await getDocs(collection(db, 'publicQR'))
    if (snap.empty) { addLog('  ∼ No publicQR docs', 'text-yellow-400'); return }
    const qrId = snap.docs[0]!.id
    const logRef = doc(collection(db, 'publicQR', qrId, 'logs'))
    await setDoc(logRef, {
      scanDate: Timestamp.now(),
      scanMetrics: { userAgent: navigator.userAgent },
      interaction: 'scan',
      img: '',
      scannerPhone: '',
    })
    testOk(lbl, { qrId, logId: logRef.id })
  } catch (e) { testError(lbl, e) }
}

// ─── ADMIN OPS ──────────────────────────────────────────────
const testReadAllUsers = async () => {
  const lbl = testLabel('ADMIN', 'Read all users', '/users (collection)')
  try {
    const snap = await getDocs(collection(db, 'users'))
    testOk(lbl, snap.docs.map(d => ({ uid: d.id, name: d.data().name, role: d.data().role })))
  } catch (e) { testError(lbl, e) }
}

const testReadAllSubs = async () => {
  const lbl = testLabel('ADMIN', 'Read all subscriptions', 'collectionGroup subscriptions')
  try {
    const snap = await getDocs(collectionGroup(db, 'subscriptions'))
    testOk(lbl, snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { testError(lbl, e) }
}

const testReadAllLogs = async () => {
  const lbl = testLabel('ADMIN', 'Read all scan logs', '/publicQR/{id}/logs')
  try {
    const qrSnap = await getDocs(collection(db, 'publicQR'))
    if (qrSnap.empty) { addLog('  ∼ No publicQR docs', 'text-yellow-400'); return }
    const logsSnap = await getDocs(collection(db, 'publicQR', qrSnap.docs[0]!.id, 'logs'))
    testOk(lbl, logsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { testError(lbl, e) }
}

const testBanUser = async () => {
  const targetUid = prompt('Enter user UID to ban/unban:') || ''
  if (!targetUid) { addLog('  ∼ No UID provided', 'text-yellow-400'); return }
  const lbl = testLabel('ADMIN', 'Ban/Unban user', `/users/${targetUid} (isBanned)`)
  try {
    const userRef = doc(db, 'users', targetUid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) { addLog('  ∼ User not found', 'text-yellow-400'); return }
    const data = snap.data()
    const isBanned = !data?.isBanned
    await updateDoc(userRef, { isBanned, banReason: isBanned ? 'Test ban from security test lab' : '' })
    testOk(lbl, { targetUid, isBanned })
  } catch (e) { testError(lbl, e) }
}

const testCreateUser = async () => {
  const targetUid = prompt('Enter UID for new user doc:') || nanoid(15)
  const lbl = testLabel('ADMIN', 'Create user doc', `/users/${targetUid}`)
  try {
    await setDoc(doc(db, 'users', targetUid), {
      uid: targetUid, name: 'Test Admin Created', email: 'test@ubiqueme.com', phone: '',
      role: 'user', isActive: true, isBanned: false, banReason: '', totalQRs: 0,
      preferences: { emailNotifications: false, smsNotifications: false, whatsappNotifications: false },
      lastLoginAt: Timestamp.now(), createdAt: Timestamp.now(),
      trialActive: false, trialStartsAt: null, trialEndsAt: null, isTrialUsed: false,
    })
    testOk(lbl, { targetUid })
  } catch (e) { testError(lbl, e) }
}

const testUpdateUserAny = async () => {
  const targetUid = prompt('Enter user UID to update:') || ''
  if (!targetUid) { addLog('  ∼ No UID provided', 'text-yellow-400'); return }
  const lbl = testLabel('ADMIN', 'Update user (any field)', `/users/${targetUid}`)
  try {
    await updateDoc(doc(db, 'users', targetUid), { name: 'Updated by Admin', lastLoginAt: Timestamp.now() })
    testOk(lbl, { targetUid })
  } catch (e) { testError(lbl, e) }
}

const testDeleteUser = async () => {
  const targetUid = prompt('Enter user UID to DELETE:') || ''
  if (!targetUid) { addLog('  ∼ No UID provided', 'text-yellow-400'); return }
  if (!confirm(`⚠️ DELETE user ${targetUid}? This is irreversible.`)) { addLog('  ∼ Cancelled', 'text-yellow-400'); return }
  const lbl = testLabel('ADMIN', 'Delete user', `/users/${targetUid}`)
  try {
    await deleteDoc(doc(db, 'users', targetUid))
    testOk(lbl, { targetUid })
  } catch (e) { testError(lbl, e) }
}

const testCreateSub = async () => {
  const targetUid = prompt('Enter user UID to create subscription for:') || ''
  if (!targetUid) { addLog('  ∼ No UID provided', 'text-yellow-400'); return }
  const subId = nanoid(15)
  const lbl = testLabel('ADMIN', 'Create subscription', `/users/${targetUid}/subscriptions/${subId}`)
  try {
    await setDoc(doc(db, 'users', targetUid, 'subscriptions', subId), {
      id: subId, userId: targetUid, planType: 'plata', status: 'active',
      purchasedAt: Timestamp.now(), endDate: Timestamp.fromDate(new Date(Date.now() + 365 * 86400000)),
      paymentProviderId: 'admin', totalQRsAllowed: 3, totalQRsCreated: 0,
      freeShipmentsAllowed: 1, freeShipmentsUsed: 0,
    })
    testOk(lbl, { targetUid, subId })
  } catch (e) { testError(lbl, e) }
}

const testCancelSub = async () => {
  const targetUid = prompt('Enter user UID:') || ''
  const subId = prompt('Enter subscription ID to cancel:') || ''
  if (!targetUid || !subId) { addLog('  ∼ Missing UID or sub ID', 'text-yellow-400'); return }
  const lbl = testLabel('ADMIN', 'Cancel subscription', `/users/${targetUid}/subscriptions/${subId}`)
  try {
    await updateDoc(doc(db, 'users', targetUid, 'subscriptions', subId), {
      status: 'canceled',
      canceledByAdmin: { name: 'Security Test', uid: userId(), reason: 'Test cancellation', canceledAt: Timestamp.now() },
    })
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

const testRenewSub = async () => {
  const targetUid = prompt('Enter user UID:') || ''
  if (!targetUid) { addLog('  ∼ No UID provided', 'text-yellow-400'); return }
  const newSubId = nanoid(15)
  const lbl = testLabel('ADMIN', 'Renew subscription', `/users/${targetUid}/subscriptions/${newSubId}`)
  try {
    await setDoc(doc(db, 'users', targetUid, 'subscriptions', newSubId), {
      id: newSubId, userId: targetUid, planType: 'plata', status: 'active',
      purchasedAt: Timestamp.now(), endDate: Timestamp.fromDate(new Date(Date.now() + 365 * 86400000)),
      paymentProviderId: 'admin', totalQRsAllowed: 3, totalQRsCreated: 0,
      freeShipmentsAllowed: 1, freeShipmentsUsed: 0,
    })
    testOk(lbl, { newSubId })
  } catch (e) { testError(lbl, e) }
}

const testAssignTrial = async () => {
  const targetUid = prompt('Enter user UID to assign trial:') || ''
  if (!targetUid) { addLog('  ∼ No UID provided', 'text-yellow-400'); return }
  const subId = nanoid(15)
  const lbl = testLabel('ADMIN', 'Assign free trial', `/users/${targetUid}/subscriptions/${subId}`)
  try {
    await setDoc(doc(db, 'users', targetUid, 'subscriptions', subId), {
      id: subId, userId: targetUid, planType: 'trial', status: 'active',
      purchasedAt: Timestamp.now(), endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 86400000)),
      paymentProviderId: 'admin', totalQRsAllowed: 1, totalQRsCreated: 0,
      freeShipmentsAllowed: 1, freeShipmentsUsed: 0,
    })
    testOk(lbl, { targetUid, subId })
  } catch (e) { testError(lbl, e) }
}

const testCreateQRAdmin = async () => {
  const targetUid = prompt('Enter user UID to create QR for:') || ''
  if (!targetUid) { addLog('  ∼ No UID provided', 'text-yellow-400'); return }
  const qrId = nanoid(15)
  const lbl = testLabel('ADMIN', 'Create QR on behalf', `/users/${targetUid}/qrs/${qrId}`)
  try {
    const batch = writeBatch(db)
    batch.set(doc(db, 'publicQR', qrId), {
      id: qrId, name: 'Admin Created QR', status: 'Active', lastScan: null,
      totalScans: 0, isBanned: false, banReason: '', docId: qrId, uid: targetUid,
      tier: 'free', isPublic: true, category: 'Test', createdAt: Timestamp.now(),
    })
    batch.set(doc(db, 'users', targetUid, 'qrs', qrId), {
      id: qrId, uid: targetUid, name: 'Admin Created QR', status: 'Active',
      scans: 0, lastScan: '', isActive: true, isBanned: false, banReason: '',
      subscriptionId: 'admin-test', createdAt: Timestamp.now(),
    })
    await batch.commit()
    testOk(lbl, { targetUid, qrId })
  } catch (e) { testError(lbl, e) }
}

const testDeleteQR = async () => {
  const targetUid = prompt('Enter user UID:') || ''
  const qrId = prompt('Enter QR ID to DELETE:') || ''
  if (!targetUid || !qrId) { addLog('  ∼ Missing UID or QR ID', 'text-yellow-400'); return }
  if (!confirm(`⚠️ DELETE QR ${qrId} for user ${targetUid}?`)) { addLog('  ∼ Cancelled', 'text-yellow-400'); return }
  const lbl = testLabel('ADMIN', 'Delete QR', `/users/${targetUid}/qrs/${qrId}`)
  try {
    await deleteDoc(doc(db, 'users', targetUid, 'qrs', qrId))
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

const testDeleteScanLog = async () => {
  const qrId = prompt('Enter publicQR ID:') || ''
  const logId = prompt('Enter log ID to DELETE:') || ''
  if (!qrId || !logId) { addLog('  ∼ Missing QR ID or log ID', 'text-yellow-400'); return }
  if (!confirm(`⚠️ DELETE scan log ${logId}?`)) { addLog('  ∼ Cancelled', 'text-yellow-400'); return }
  const lbl = testLabel('ADMIN', 'Delete scan log', `/publicQR/${qrId}/logs/${logId}`)
  try {
    await deleteDoc(doc(db, 'publicQR', qrId, 'logs', logId))
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

const testDeletePublicQR = async () => {
  const qrId = prompt('Enter publicQR ID to DELETE:') || ''
  if (!qrId) { addLog('  ∼ No QR ID provided', 'text-yellow-400'); return }
  if (!confirm(`⚠️ DELETE publicQR ${qrId}?`)) { addLog('  ∼ Cancelled', 'text-yellow-400'); return }
  const lbl = testLabel('ADMIN', 'Delete publicQR', `/publicQR/${qrId}`)
  try {
    await deleteDoc(doc(db, 'publicQR', qrId))
    testOk(lbl)
  } catch (e) { testError(lbl, e) }
}

// ─── PUBLIC OPS ─────────────────────────────────────────────
const testPublicReadPublicQR = async () => {
  const lbl = testLabel('PUBLIC', 'Read publicQR (no auth)', '/publicQR/{id} (allow read: if true)')
  try {
    const snap = await getDocs(collection(db, 'publicQR'))
    testOk(lbl, snap.docs.slice(0, 3).map(d => ({ id: d.id, name: d.data().name })))
  } catch (e) { testError(lbl, e) }
}

const testPublicCreateScanLog = async () => {
  const lbl = testLabel('PUBLIC', 'Create scan log (anonymous)', '/publicQR/{id}/logs')
  try {
    const snap = await getDocs(collection(db, 'publicQR'))
    if (snap.empty) { addLog('  ∼ No publicQR docs', 'text-yellow-400'); return }
    const qrId = snap.docs[0]!.id
    const logRef = doc(collection(db, 'publicQR', qrId, 'logs'))
    await setDoc(logRef, {
      scanDate: Timestamp.now(),
      scanMetrics: { userAgent: navigator.userAgent },
      interaction: 'scan',
      img: '',
      scannerPhone: '',
    })
    testOk(lbl, { qrId, logId: logRef.id })
  } catch (e) { testError(lbl, e) }
}
</script>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
  border-width: 1px;
  border-style: solid;
  border-color: inherit;
  background-color: rgba(255, 255, 255, 0.02);
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.action-card:active {
  transform: scale(0.98);
}
</style>
