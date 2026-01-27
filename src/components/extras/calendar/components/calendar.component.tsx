import Loader from "@components/extras/loader";
import { sizeIcon } from "@infrastructure/utils/client";
import { ChevronLeft, ChevronRight } from "lucide-preact";
import { Fragment } from "preact/jsx-runtime";
import { type CalendarProps, useCalendar } from "../hooks/use-calendar.hook";

function Calendar(props: CalendarProps) {
	const {
		changeMonth = true,
		image,
		tooltip = [],
		isLoading = false,
		custom,
		finalDate,
	} = props;

	const {
		date,
		daysOfWeek,
		months,
		previousMonth,
		nextMonth,
		chooseDay,
		renderDays,
		isNextMonthDisabled,
	} = useCalendar(props);

	return (
		<div class="p-4! w-full max-w-md mx-auto">
			{image && (
				<img
					class="w-full h-[150px] object-cover rounded-t-lg mb-4"
					src={image}
					alt="Calendar header"
					title="Calendar header"
					width={448}
					height={150}
					loading="lazy"
				/>
			)}

			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-bold text-foreground">
					{months[date.getMonth()]} {date.getFullYear()}
				</h2>
				<div class="flex items-center gap-2">
					{isLoading && <Loader />}
					{changeMonth && (
						<div class="flex gap-2 fill-primary">
							<button
								type="button"
								onClick={previousMonth}
								disabled={isLoading}
								class="p-2 rounded-lg hover:bg-hover"
							>
								<ChevronLeft {...sizeIcon.small} />
							</button>
							<button
								type="button"
								onClick={nextMonth}
								class={`p-2 rounded-lg hover:bg-hover ${
									isNextMonthDisabled ? "opacity-50 cursor-not-allowed" : ""
								}`}
								disabled={isNextMonthDisabled || isLoading}
							>
								<ChevronRight {...sizeIcon.small} />
							</button>
						</div>
					)}
				</div>
			</div>
			<div class="bg-card border border-border rounded-lg">
				<div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
					{daysOfWeek.map((day, index) => (
						<div
							key={day}
							class={`px-1 py-2 font-semibold ${
								index === 6 ? "text-destructive" : ""
							}`}
						>
							{day}
						</div>
					))}
				</div>
				{isLoading ? (
					<div class="grid grid-cols-7 gap-1 text-center text-sm">
						{renderDays().map((_, i) => (
							<div key={i} class="bg-muted py-4 px-4 rounded-lg" />
						))}
					</div>
				) : (
					<div class="grid grid-cols-7 gap-1 text-center text-sm">
						{renderDays().map((day, index) => {
							if (day === "") {
								return <div key={`empty-${index}`} class="py-2 px-4" />;
							}

							const dayNumber = day as number;
							const currentDate = new Date(
								date.getFullYear(),
								date.getMonth(),
								dayNumber,
							);
							const isToday =
								dayNumber === new Date().getDate() &&
								date.getMonth() === new Date().getMonth() &&
								date.getFullYear() === new Date().getFullYear();
							const isSelected = dayNumber === date.getDate();
							const isSunday = index % 7 === 6;
							const isDayDisabled = finalDate ? currentDate > finalDate : false;

							return (
								<div
									key={dayNumber}
									class={`py-2 px-4 rounded-lg cursor-pointer flex justify-center items-center transition-colors ${
										isDayDisabled
											? "text-muted-foreground cursor-not-allowed"
											: "hover:bg-accent"
									} ${
										isSelected && !isDayDisabled
											? "bg-primary text-primary-foreground font-bold"
											: isToday && !isDayDisabled
												? "bg-accent text-accent-foreground font-medium"
												: isSunday && !isDayDisabled
													? "text-destructive font-medium"
													: ""
									}
                                relative 
                                `}
									onClick={() => {
										if (!isDayDisabled) {
											chooseDay(dayNumber);
										}
									}}
								>
									{tooltip
										.filter((tool) =>
											tool.result.some(
												(result) =>
													new Date(result.date).toDateString() ===
													currentDate.toDateString(),
											),
										)
										.map((tool) => {
											const matchingResults = tool.result.filter(
												(result) =>
													new Date(result.date).toDateString() ===
													currentDate.toDateString(),
											);

											return matchingResults.map((result, indexResult) => (
												<Fragment
													key={`${tool.color}-${result.date}-${indexResult}`}
												>
													<div
														style={{
															bottom: `${(index + indexResult) * 4}px`,
															backgroundColor: tool.color,
														}}
														class="absolute left-0 w-full h-1.5 z-10 group"
													>
														{result.tooltip && (
															<div class="absolute left-0 z-20 hidden group-hover:block bg-popover text-popover-foreground px-2 w-[100px] py-1 text-sm border border-border shadow-sm rounded-lg">
																{result.tooltip}
															</div>
														)}
													</div>
												</Fragment>
											));
										})}

									{dayNumber.toString().padStart(2, "0")}
									{custom
										? custom(dayNumber, date.getMonth(), date.getFullYear())
										: null}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

export default Calendar;
