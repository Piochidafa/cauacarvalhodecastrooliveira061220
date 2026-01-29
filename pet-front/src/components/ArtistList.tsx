import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Paginator } from "primereact/paginator";
import { Menubar } from "primereact/menubar";

import defaultUserPFP from "../assets/ArtistaAssets/defaultSinger.png";
import svgMenuBar from "../assets/ArtistaAssets/music-tone-svgrepo-com.svg";
import svgDisco from "../assets/ArtistaAssets/disco-svgrepo-com.svg";

import artistaFacade from "../services/facades/artistaFacade";
import type { Artista } from "../services/types/artista.types";
import { Image } from "primereact/image";
import ArtistCreateModal from "./ArtistCreateModal";
import { AnimatePresence, motion } from "motion/react";

interface PaginatorChangeEvent {
	page: number;
	rows: number;
	first: number;
}

function ArtistList() {
	const navigate = useNavigate();
	const [artistas, setArtistas] = useState<Artista[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [page, setPage] = useState(0);
	const [rows, setRows] = useState(8);
	const [totalRecords, setTotalRecords] = useState(0);
	const [createDialogVisible, setCreateDialogVisible] = useState(false);
	const [newArtistName, setNewArtistName] = useState("");
	const [newArtistImageFile, setNewArtistImageFile] = useState<File | null>(
		null,
	);
	const [newArtistPreviewUrl, setNewArtistPreviewUrl] = useState<string | null>(
		null,
	);
	const [creatingArtist, setCreatingArtist] = useState(false);
	const [artistActionsEnabled, setArtistActionsEnabled] = useState(true);

	useEffect(() => {
		const fetchArtistas = async () => {
			try {
				console.log("Carregando artistas com página:", page, "linhas:", rows);
				if (searchTerm.trim()) {
					await artistaFacade.searchArtistas(
						searchTerm,
						page,
						rows,
						"nome",
						sortOrder,
					);
				} else {
					await artistaFacade.loadArtistas(page, rows, "nome", sortOrder);
				}
			} catch (err) {
				toast.error("Erro ao carregar artistas");
			}
		};
		fetchArtistas();
	}, [page, rows, sortOrder]);

	useEffect(() => {
		console.log("Subscribe effect mounted");
		const artistasSubscription = artistaFacade.artistas$.subscribe(
			(newArtistas) => {
				console.log("Artistas atualizados:", newArtistas);
				setArtistas(newArtistas);
			},
		);
		const loadingSubscription = artistaFacade.loading$.subscribe(
			(loadingState) => {
				console.log("Loading state:", loadingState);
				setLoading(loadingState);
			},
		);
		const errorSubscription = artistaFacade.error$.subscribe((error) => {
			console.log("Error:", error);
			if (error) toast.error(error);
		});
		const paginationSubscription = artistaFacade.pagination$.subscribe(
			(pagination) => {
				console.log("Pagination:", pagination);
				setTotalRecords(pagination.totalElements);
			},
		);

		return () => {
			artistasSubscription.unsubscribe();
			loadingSubscription.unsubscribe();
			errorSubscription.unsubscribe();
			paginationSubscription.unsubscribe();
		};
	}, []);

	const loadArtistas = async () => {
		if (searchTerm.trim()) {
			await artistaFacade.searchArtistas(
				searchTerm,
				0,
				rows,
				"nome",
				sortOrder,
			);
			setPage(0);
		} else {
			await artistaFacade.loadArtistas(0, rows, "nome", sortOrder);
			setPage(0);
		}
	};

	const handleCreateArtist = async () => {
		if (!newArtistName.trim()) {
			toast.error("Nome do artista é obrigatório");
			return;
		}

		setCreatingArtist(true);
		try {
			const created = await artistaFacade.createArtista({
				nome: newArtistName.trim(),
			});
			if (created?.id && newArtistImageFile) {
				await artistaFacade.uploadArtistaImage(created.id, newArtistImageFile);
			}
			toast.success("Artista criado com sucesso!");
			setCreateDialogVisible(false);
			setNewArtistName("");
			setNewArtistImageFile(null);
			if (newArtistPreviewUrl) {
				URL.revokeObjectURL(newArtistPreviewUrl);
				setNewArtistPreviewUrl(null);
			}
			await loadArtistas();
		} catch (error: any) {
			toast.error(error.message || "Erro ao criar artista");
		} finally {
			setCreatingArtist(false);
		}
	};

	const handleNewArtistImageChange = (file: File | null) => {
		setNewArtistImageFile(file);
		if (newArtistPreviewUrl) {
			URL.revokeObjectURL(newArtistPreviewUrl);
		}
		if (file) {
			setNewArtistPreviewUrl(URL.createObjectURL(file));
		} else {
			setNewArtistPreviewUrl(null);
		}
	};

	const handleRowClick = (artista: Artista) => {
		navigate(`/artista/${artista.id}`);
	};

	const handleLogout = () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		window.dispatchEvent(new Event("authChange"));
		navigate("/login");
	};

	const toggleSortOrder = () => {
		setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
	};

	const clearSearch = async () => {
		setSearchTerm("");
		setPage(0);
		await artistaFacade.loadArtistas(0, rows, "nome", sortOrder);
	};

	const handlePageChange = (e: PaginatorChangeEvent) => {
		setPage(e.page);
		setRows(e.rows);
	};

	const header = (
		<motion.div
			className="grid flex flex-column gap-2 "
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
		>
			<div
				style={{
					height: "5vh",
				}}
				className="flex flex-column align-items-center "
			>
				<motion.div
					className="flex gap-2 align-items-center col-12"
					initial={{ opacity: 0, y: -6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.3 }}
				>
					<InputText
						placeholder="Buscar artista..."
						className="flex-1 border-round-lg"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								loadArtistas();
							}
						}}
						style={{
							height: "3.2vh",
							padding: "2vh",
						}}
					/>
					<div className="flex flex-row gap-2 flex-shrink-0">
						<Button
							label="Limpar"
							icon="pi pi-times"
							className="border-round-lg gap-2 px-3 p-button-text"
							style={{
								padding: "0.9vh",
							}}
							onClick={clearSearch}
							disabled={!searchTerm.trim()}
						/>
						<Button
							label={`${sortOrder === "asc" ? "A-Z" : "Z-A"}`}
							icon="pi pi-sort-alt"
							className="border-round-lg gap-2 px-3"
							style={{
								padding: "0.9vh",
							}}
							onClick={toggleSortOrder}
						/>
						<Button
							label="Buscar"
							className="px-4 gap-2 border-round-lg"
							icon="pi pi-search"
							style={{
								padding: "0.9vh",
							}}
							onClick={loadArtistas}
						/>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);

	return (
		<motion.div
			className="flex flex-column"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.35 }}
		>
			<motion.div
				initial={{ y: -12, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.35, ease: "easeOut" }}
			>
				<Menubar
				className="flex-row"
				style={{
					display: "flex",
					justifyContent: "space-around",
					alignItems: "center",
					padding: "1vh",
					flexDirection: "column",
					width: "100%",
					marginBottom: "2vh",
					gap: "7vw",
				}}
				start={
					<Link
						className="flex flex-row gap-2 align-items-center"
						to="/"
						style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff" }}
					>
						<div
							className=" border-round-2xl"
							style={{
								backgroundColor: "#ba68c8",
								padding: "0.6vh",
								paddingLeft: "1vh",
								paddingRight: "1vh",
							}}
						>
							<img src={svgMenuBar} width="25vw" />
						</div>
						MusicLib
					</Link>
				}
				end={
					<div className="flex align-items-center gap-3">
						<Button
							label="Novo Artista"
							icon="pi pi-plus"
							onClick={() => setCreateDialogVisible(true)}
							className="gap-2 border-round-lg px-2"
							style={{ padding: "0.6vh" }}
						/>
						<Button
							label="Logout"
							icon="pi pi-sign-out"
							onClick={handleLogout}
							className="p-button-text gap-2 flex align-items-center border-2 border-600 border-round-lg"
							style={{ padding: "0.6vh" }}
						/>
					</div>
				}
				/>
			</motion.div>
			<div
				className="flex flex-column"
				style={{
					paddingLeft: "20vh",
					paddingRight: "20vh"
				}}
			>
				<div
					title="Artistas"
					className="p-3  text-green-50 "
					style={{ height: "100%", width: "100%" }}
				>
					{loading ? (
						<div className="flex justify-content-center align-items-center p-5">
							<ProgressSpinner />
						</div>
					) : (
						<>
							<motion.div
								className="flex flex-column gap-6 justify-content-between mb-3"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.35, delay: 0.1 }}
							>
								<div className="flex flex-column gap-2 ">
									<motion.h1
										className=""
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.35, delay: 0.15 }}
									>
										Artistas
									</motion.h1>
									<span className=" text-md " style={{ color: "gray" }}>
										Explore seus artistas favoritos
									</span>
								</div>
								<div>{header}</div>
							</motion.div>

							<div className="h-full flex flex-column">
								<motion.div
									className="grid flex-1"
									initial="hidden"
									animate="visible"
									variants={{
										hidden: { opacity: 0 },
										visible: {
											opacity: 1,
											transition: { staggerChildren: 0.05 },
										},
									}}
								>
									<AnimatePresence>
										{artistas.map((artista) => {
											return (
												<motion.div
													key={artista.id}
													className="col-12 md:col-5 lg:col-3 xl:col-3 h-30rem"
													layout
													variants={{
														hidden: { opacity: 0, y: 16 },
														visible: { opacity: 1, y: 0 },
													}}
													transition={{ duration: 0.25, ease: "easeOut" }}
													whileHover={{ y: -4, scale: 1.01 }}
													exit={{ opacity: 0, y: 12 }}
												>
													<Card
														className=" cursor-pointer hover:shadow-4 hover:border-2 p-0 transition-duration-200 h-full card-hover border-round-xl"
														onClick={() => handleRowClick(artista)}
														style={{
															display: "flex",
															flexDirection: "column",
															minHeight: "0",
															overflow: "hidden",
															background: "#111111",
														}}
													>
														<div
															className="flex flex-column"
															style={{ minHeight: "0", gap: "0" }}
														>
															<motion.div
																className="w-full"
																whileHover={{ scale: 1.03 }}
																transition={{ duration: 0.3, ease: "easeOut" }}
															>
																<Image
																	src={
																		artista.imageUrl
																			? artista.imageUrl
																			: defaultUserPFP
																	}
																	imageStyle={{
																		width: "100%",
																		height: "38vh",
																		objectFit: "cover",
																		display: "block",
																	}}
																/>
															</motion.div>

															<div
																className="flex flex-column flex-grow-1 min-w-0 align-items-start"
																style={{
																	background: "#111111",
																	padding: "1rem",
																}}
															>
																<div className="flex flex-row justify-content-between align-items-center">
																	<span
																		className=" pointer font-bold text-lg pt-2 pl-1"
																		style={{
																			 wordBreak: "break-word", 
																			 
																			}}
																	>
																		{artista.nome}
																	</span>
																</div>

																<div
																	className="flex-grow-1 flex flex-column"
																	style={{ minHeight: "0", overflow: "hidden" }}
																>
																	<div className="flex flex-row align-items-center mt-2">
																		<div className="flex flex-row gap-1 align-items-center">
																			<img src={svgDisco} width="24vh" />
																			<span
																				className="text-sm font-semibold block text-md font-bold"
																				style={{ color: "gray" }}
																			>
																				{artista.quantidadeAlbuns || 0}
																				{artista.quantidadeAlbuns === 1 ? " Álbum" : " Álbuns"}
																			</span>
																		</div>
																	</div>
																	<div
																		className="gap-2 align-content-center justify-content-center"
																		style={{
																			display: "grid",
																			gridTemplateColumns: "repeat(2, 1fr)",
																			gridAutoRows: "1fr",
																			width: "100%",
																			justifyItems: "center",
																		}}
																	></div>
																</div>
															</div>
														</div>
													</Card>
												</motion.div>
											);
										})}
									</AnimatePresence>
									{artistas.length === 0 && (
										<div className="text-center p-5 text-500">
											Nenhum artista encontrado
										</div>
									)}
								</motion.div>
							</div>
							{artistas.length > 0 && (
								<motion.div
									className="flex flex-row justify-content-center align-content-center py-6"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
								>
									<Paginator
										style={{ paddingInline: "1vh", border: "none" }}
										first={page * rows}
										rows={rows}
										totalRecords={totalRecords}
										onPageChange={handlePageChange}
									/>
								</motion.div>
							)}
						</>
					)}
				</div>
			</div>

			<ArtistCreateModal
				visible={createDialogVisible}
				value={newArtistName}
				loading={creatingArtist}
				onChange={setNewArtistName}
				onCancel={() => {
					if (!creatingArtist) {
						setCreateDialogVisible(false);
						setNewArtistName("");
						setNewArtistImageFile(null);
						if (newArtistPreviewUrl) {
							URL.revokeObjectURL(newArtistPreviewUrl);
						}
						setNewArtistPreviewUrl(null);
					}
				}}
				onSave={handleCreateArtist}
				imagePreviewUrl={newArtistPreviewUrl}
				onImageChange={handleNewArtistImageChange}
			/>
		</motion.div>
	);
}

export default ArtistList;
