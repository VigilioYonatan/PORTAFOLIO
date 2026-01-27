import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { io, type ManagerOptions, type Socket } from "socket.io-client";

// CONECTAR CON SOCKET IO PERSONALIZADO
function useSocket(base_url: string, options: Partial<ManagerOptions>) {
	const socket = useSignal<Socket | null>(null);
	const isConnect = useSignal<boolean>(false);
	const isLeader = useSignal<boolean>(false);

	function connectSocket() {
		const chatio = io(base_url, options);
		socket.value = chatio;
		return () => {
			chatio.disconnect();
		};
	}
	function disconnectSocket() {
		socket.value?.disconnect();
	}
	useEffect(() => {
		socket.value?.on("connect", () => {
			isConnect.value = true;
		});
	}, [socket.value]);

	useEffect(() => {
		socket.value?.on("disconnect", () => {
			isConnect.value = false;
		});
	}, [socket.value]);

	useEffect(() => {
		// Incrementa contador de pestañas
		const tabs = Number.parseInt(localStorage.getItem("tabs") || "0", 10) + 1;
		localStorage.setItem("tabs", tabs.toString());

		function tryBecomeLeader() {
			const leader = localStorage.getItem("socket_leader");
			if (!leader) {
				const timestamp = Date.now().toString();
				localStorage.setItem("socket_leader", timestamp);
				isLeader.value = true;
			}
		}

		tryBecomeLeader();

		function handleStorage(e: StorageEvent) {
			if (e.key === "socket_leader") {
				const leader = e.newValue;
				const myLeader = localStorage.getItem("socket_leader");
				isLeader.value = leader === myLeader;
			}
		}

		window.addEventListener("storage", handleStorage);

		function handleBeforeUnload() {
			const tabs = Math.max(
				0,
				Number.parseInt(localStorage.getItem("tabs") || "1", 10) - 1,
			);
			localStorage.setItem("tabs", tabs.toString());

			const currentLeader = localStorage.getItem("socket_leader");

			if (isLeader && tabs === 0 && socket.value) {
				socket.value.disconnect();
			}

			if (isLeader && currentLeader) {
				localStorage.removeItem("socket_leader");
			}
		}

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("storage", handleStorage);
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isLeader.value]);

	return { isConnect, socket, connectSocket, disconnectSocket };
}

export default useSocket;
