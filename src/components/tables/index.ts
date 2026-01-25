import Footer from "./Footer";
import Header from "./Header";
import Limit from "./Limit";
import Paginator from "./Paginator";
import Refetch from "./Refetch";
import Show from "./Show";
import Table from "./Table";
import Tbody from "./Tbody";
import TbodyRow from "./TbodyRow";
import Td from "./Td";
import Th from "./Th";
import Thead from "./Thead";
import TheadRow from "./TheadRow";
import Tools from "./Tools";
import V from "./VigilioTable";

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
