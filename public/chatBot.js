(function () {
    const scriptTag = document.currentScript;
    if (!scriptTag) {
        console.warn("[support-ai] could not find the chatBot script tag")
        return
    }

    const apiUrl = new URL("/api/chat", scriptTag.src).toString()
    const ownerId = scriptTag.getAttribute("data-owner-id")

    if (!ownerId) {
        console.warn("[support-ai] data-owner-id is missing on the script tag")
        return
    }

    // How many earlier messages to send with each question, so follow-ups keep context.
    const MAX_HISTORY = 10
    const MAX_MESSAGE_LENGTH = 1000
    const history = []

    // Everything lives inside a Shadow DOM so the host page's CSS and IDs can't clash with ours.
    const host = document.createElement("div")
    host.setAttribute("data-support-ai", "")
    const root = host.attachShadow({ mode: "open" })

    const CHAT_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg>'
    const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'

    root.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }

      .launcher {
        position: fixed; bottom: 24px; right: 24px;
        width: 56px; height: 56px; border-radius: 50%;
        border: none; background: #0b6e6e; color: #fff;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        box-shadow: 0 14px 34px -8px rgba(15,29,32,0.5);
        transition: transform .15s ease, background .15s ease;
        z-index: 2147483000;
      }
      .launcher:hover { transform: scale(1.05); background: #085959; }
      .launcher:focus-visible, .close:focus-visible, .send:focus-visible, .input:focus-visible {
        outline: 2px solid #2a9d8f; outline-offset: 2px;
      }

      .box {
        position: fixed; bottom: 92px; right: 24px;
        width: 360px; max-width: calc(100vw - 32px);
        height: 520px; max-height: calc(100vh - 120px);
        background: #fff; border-radius: 12px;
        border: 1px solid #dfe6e6;
        box-shadow: 0 24px 60px -18px rgba(15,29,32,0.4);
        display: none; flex-direction: column; overflow: hidden;
        z-index: 2147483000;
        transform-origin: bottom right;
      }
      .box.open { display: flex; animation: pop .18s ease-out; }
      @keyframes pop { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }

      @media (max-width: 480px) {
        .launcher { right: 16px; bottom: 16px; }
        .box { right: 8px; left: 8px; bottom: 84px; width: auto; max-width: none; height: calc(100vh - 100px); }
      }

      .header {
        background: #0f1d20; color: #f4f7f7; padding: 12px 12px 12px 16px;
        display: flex; justify-content: space-between; align-items: center; gap: 10px;
      }
      .identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .avatar {
        width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
        background: #2a9d8f; color: #fff; font-size: 12px; font-weight: 600;
        display: flex; align-items: center; justify-content: center;
      }
      .title { font-size: 14px; font-weight: 600; line-height: 1.2; }
      .subtitle { font-size: 11px; color: rgba(244,247,247,0.7); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
      .close {
        background: none; border: none; color: rgba(244,247,247,0.75);
        cursor: pointer; width: 32px; height: 32px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
      }
      .close:hover { background: rgba(255,255,255,0.1); color: #fff; }

      .messages {
        flex: 1; padding: 14px; overflow-y: auto; background: #f4f7f7;
        display: flex; flex-direction: column; gap: 8px;
      }
      .bubble {
        max-width: 82%; padding: 9px 13px; border-radius: 10px;
        font-size: 14px; line-height: 1.45;
        white-space: pre-wrap; overflow-wrap: anywhere;
        animation: rise .2s ease-out;
      }
      @keyframes rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      .bubble.user { align-self: flex-end; background: #0b6e6e; color: #fff; border-bottom-right-radius: 3px; }
      .bubble.ai { align-self: flex-start; background: #fff; color: #0f1d20; border: 1px solid #dfe6e6; border-bottom-left-radius: 3px; }
      .bubble.error { background: #fdecea; color: #b42318; border-color: rgba(180,35,24,0.2); }

      .typing {
        align-self: flex-start; display: flex; gap: 4px;
        padding: 12px 14px; background: #fff; border: 1px solid #dfe6e6;
        border-radius: 10px; border-bottom-left-radius: 3px;
      }
      .typing span { width: 6px; height: 6px; border-radius: 50%; background: #86979a; animation: blink 1.2s infinite; }
      .typing span:nth-child(2) { animation-delay: .15s; }
      .typing span:nth-child(3) { animation-delay: .3s; }
      @keyframes blink { 0%, 60%, 100% { opacity: .25; } 30% { opacity: 1; } }

      .composer { display: flex; border-top: 1px solid #dfe6e6; padding: 10px; gap: 8px; background: #fff; }
      .input {
        flex: 1; min-width: 0; padding: 10px 12px;
        border: 1px solid #c5d1d2; border-radius: 8px;
        font-size: 14px; outline: none; color: #0f1d20; background: #fff;
      }
      .input:focus { border-color: #0b6e6e; }
      .send {
        padding: 0 16px; border: none; background: #0b6e6e; color: #fff;
        border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;
      }
      .send:disabled { opacity: 0.4; cursor: not-allowed; }
      .footer { text-align: center; font-size: 10px; color: #86979a; padding: 0 0 8px; background: #fff; }

      @media (prefers-reduced-motion: reduce) {
        .box.open, .bubble, .typing span { animation: none; }
      }
    </style>

    <button class="launcher" type="button" aria-label="Open customer support chat" aria-expanded="false">${CHAT_ICON}</button>

    <div class="box" role="dialog" aria-label="Customer support chat">
      <div class="header">
        <div class="identity">
          <span class="avatar" aria-hidden="true">AI</span>
          <div>
            <div class="title">Customer support</div>
            <div class="subtitle">Usually replies in a few seconds</div>
          </div>
        </div>
        <button class="close" type="button" aria-label="Close chat">${CLOSE_ICON}</button>
      </div>
      <div class="messages" role="log" aria-live="polite"></div>
      <form class="composer">
        <input class="input" type="text" placeholder="Type your question…"
               aria-label="Type a message" maxlength="${MAX_MESSAGE_LENGTH}" autocomplete="off" />
        <button class="send" type="submit">Send</button>
      </form>
      <div class="footer">Powered by SupportAI</div>
    </div>
    `

    const launcher = root.querySelector(".launcher")
    const box = root.querySelector(".box")
    const closeBtn = root.querySelector(".close")
    const form = root.querySelector(".composer")
    const input = root.querySelector(".input")
    const sendBtn = root.querySelector(".send")
    const messageArea = root.querySelector(".messages")

    let sending = false

    let greeted = false

    function setOpen(open) {
        box.classList.toggle("open", open)
        launcher.innerHTML = open ? CLOSE_ICON : CHAT_ICON
        if (open && !greeted) {
            greeted = true
            addMessage("Hi! How can we help?", "ai")
        }
        launcher.setAttribute("aria-expanded", String(open))
        launcher.setAttribute("aria-label", open ? "Close customer support chat" : "Open customer support chat")
        if (open) {
            input.focus()
        } else {
            launcher.focus()
        }
    }

    launcher.addEventListener("click", () => setOpen(!box.classList.contains("open")))
    closeBtn.addEventListener("click", () => setOpen(false))
    box.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false)
    })

    function scrollToBottom() {
        messageArea.scrollTop = messageArea.scrollHeight
    }

    function addMessage(text, from, isError) {
        const bubble = document.createElement("div")
        bubble.className = `bubble ${from}${isError ? " error" : ""}`
        // textContent (not innerHTML) so user or AI text can never run as HTML/script.
        bubble.textContent = text
        messageArea.appendChild(bubble)
        scrollToBottom()
    }

    function setSending(value) {
        sending = value
        sendBtn.disabled = value
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault()
        if (sending) return

        const text = input.value.trim().slice(0, MAX_MESSAGE_LENGTH)
        if (!text) return

        addMessage(text, "user")
        input.value = ""
        setSending(true)

        const typing = document.createElement("div")
        typing.className = "typing"
        typing.setAttribute("aria-label", "Typing")
        typing.innerHTML = "<span></span><span></span><span></span>"
        messageArea.appendChild(typing)
        scrollToBottom()

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ownerId,
                    message: text,
                    history: history.slice(-MAX_HISTORY),
                }),
            })

            let data = null
            try {
                data = await response.json()
            } catch {
                // Non-JSON response (e.g. a gateway error page); handled below.
            }

            if (!response.ok) {
                throw new Error(data?.message || "We could not generate a reply right now. Please try again.")
            }

            const reply = typeof data === "string" ? data : data?.message
            if (!reply) {
                throw new Error("We could not generate a reply right now. Please try again.")
            }

            addMessage(reply, "ai")
            history.push({ role: "user", text }, { role: "ai", text: reply })
        } catch (error) {
            console.warn("[support-ai]", error)
            addMessage(error?.message || "Something went wrong. Please try again.", "ai", true)
        } finally {
            typing.remove()
            setSending(false)
            input.focus()
        }
    })

    function mount() {
        document.body.appendChild(host)
    }

    if (document.body) {
        mount()
    } else {
        document.addEventListener("DOMContentLoaded", mount)
    }
})()
