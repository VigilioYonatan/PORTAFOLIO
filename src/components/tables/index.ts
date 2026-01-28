import Footer from "./footer";
import Header from "./header";
import Limit from "./limit";
import Paginator from "./paginator";
import Refetch from "./refetch";
import Show from "./show";
import Table from "./table";
import Tbody from "./tbody";
import TbodyRow from "./tbody-row";
import Td from "./td";
import Th from "./th";
import Thead from "./thead";
import TheadRow from "./thead-row";
import Tools from "./tools";
import V from "./vigilio-table";

const VigilioTable = Object.assign(V, {
	header: Object.assign(Header, {
		tools: Tools,
		limit: Limit,
		refetch: Refetch,
	}),
	table: Table,
	thead: Object.assign(Thead, {
		row: TheadRow,
		th: Th,
	}),
	tbody: Object.assign(Tbody, {
		row: TbodyRow,
		td: Td,
	}),
	footer: Object.assign(Footer, {
		show: Show,
		paginator: Paginator,
	}),
});
export default VigilioTable;
