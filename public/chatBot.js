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

    root.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: Inter, system-ui, sans-serif; }

      .launcher {
        position: fixed; bottom: 24px; right: 24px;
        width: 56px; height: 56px; border-radius: 50%;
        border: none; background: #000; color: #fff;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 22px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.35);
        z-index: 999999;
      }
      .launcher:focus-visible, .close:focus-visible, .send:focus-visible {
        outline: 2px solid #2563eb; outline-offset: 2px;
      }

      .box {
        position: fixed; bottom: 90px; right: 24px;
        width: 320px; max-width: calc(100vw - 32px);
        height: 420px; max-height: calc(100vh - 120px);
        background: #fff; border-radius: 14px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.25);
        display: none; flex-direction: column; overflow: hidden;
        z-index: 999999;
      }
      .box.open { display: flex; }

      @media (max-width: 480px) {
        .launcher { right: 16px; bottom: 16px; }
        .box { right: 16px; bottom: 82px; }
      }

      .header {
        background: #000; color: #fff; padding: 12px 14px; font-size: 14px;
        display: flex; justify-content: space-between; align-items: center;
      }
      .close {
        background: none; border: none; color: #fff;
        cursor: pointer; font-size: 16px; padding: 0 4px;
      }

      .messages {
        flex: 1; padding: 12px; overflow-y: auto; background: #f9fafb;
        display: flex; flex-direction: column;
      }
      .bubble {
        max-width: 78%; padding: 8px 12px; border-radius: 14px;
        font-size: 13px; line-height: 1.4; margin-bottom: 8px;
        white-space: pre-wrap; overflow-wrap: anywhere;
      }
      .bubble.user {
        align-self: flex-end; background: #000; color: #fff;
        border-top-right-radius: 4px;
      }
      .bubble.ai {
        align-self: flex-start; background: #e5e7eb; color: #111;
        border-top-left-radius: 4px;
      }
      .typing { font-size: 12px; color: #6b7280; margin-bottom: 8px; align-self: flex-start; }

      .composer {
        display: flex; border-top: 1px solid #e5e7eb; padding: 8px; gap: 6px; background: #fff;
      }
      .input {
        flex: 1; min-width: 0; padding: 8px 10px;
        border: 1px solid #d1d5db; border-radius: 8px;
        font-size: 13px; outline: none; color: #111; background: #fff;
      }
      .input:focus { border-color: #000; }
      .send {
        padding: 8px 12px; border: none; background: #000; color: #fff;
        border-radius: 8px; font-size: 13px; cursor: pointer;
      }
      .send:disabled { opacity: 0.5; cursor: not-allowed; }
    </style>

    <button class="launcher" type="button" aria-label="Open customer support chat" aria-expanded="false">🗨️</button>

    <div class="box" role="dialog" aria-label="Customer support chat">
      <div class="header">
        <span>Customer Support</span>
        <button class="close" type="button" aria-label="Close chat">╳</button>
      </div>
      <div class="messages" role="log" aria-live="polite"></div>
      <form class="composer">
        <input class="input" type="text" placeholder="Type a message"
               aria-label="Type a message" maxlength="${MAX_MESSAGE_LENGTH}" autocomplete="off" />
        <button class="send" type="submit">Send</button>
      </form>
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

    function setOpen(open) {
        box.classList.toggle("open", open)
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

    function addMessage(text, from) {
        const bubble = document.createElement("div")
        bubble.className = `bubble ${from}`
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
        typing.textContent = "Typing..."
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
            addMessage(error?.message || "Something went wrong. Please try again.", "ai")
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
