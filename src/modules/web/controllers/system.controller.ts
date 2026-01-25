import { Public } from "@modules/auth/decorators/public.decorator";
import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import * as os from "os";

@Controller({ path: "/system", version: VERSION_NEUTRAL })
export class SystemController {
	@Public()
	@Get("/stats")
	getStats() {
		const cpus = os.cpus();
		const freeMem = os.freemem();
		const totalMem = os.totalmem();
        const uptime = os.uptime();
        const loadAvg = os.loadavg(); // Returns [1, 5, 15] min averages

		return {
			cpuModel: cpus[0]?.model || "Unknown",
            cpuCount: cpus.length,
            // Calculate rough CPU usage from load avg relative to core count (very rough estimate for Node)
            cpuLoad: (loadAvg[0] / cpus.length) * 100, 
			freeMem,
			totalMem,
            memUsagePercent: ((totalMem - freeMem) / totalMem) * 100,
            uptime,
            platform: os.platform(),
            arch: os.arch()
		};
	}
}
