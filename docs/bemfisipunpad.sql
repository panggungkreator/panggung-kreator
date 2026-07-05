-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 01, 2021 at 06:12 AM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 7.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bemfisipunpad`
--

-- --------------------------------------------------------

--
-- Table structure for table `build_akun_media_sosial`
--

CREATE TABLE `build_akun_media_sosial` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `image` text COLLATE latin1_general_ci DEFAULT NULL,
  `name` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `id_name` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `link` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_akun_media_sosial`
--

INSERT INTO `build_akun_media_sosial` (`id`, `image`, `name`, `id_name`, `link`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('3607072021200615', '/bemfisipunpad/control/_filemanager/akun_media_sosial/Icon_awesome-line.png', 'Line', '@251lgcrk', '#', 'active', 1, '2021-07-07 20:06:15', 'a1', '2021-07-14 11:54:53', 'a1'),
('4007072021200745', '/bemfisipunpad/control/_filemanager/akun_media_sosial/Icon_simple-instagram.png', 'Instagram', '@bemfisipunpad', 'https://www.instagram.com/bemfisipunpad/', 'active', 2, '2021-07-07 20:07:45', 'a1', '2021-07-12 17:41:43', 'a1');

-- --------------------------------------------------------

--
-- Table structure for table `build_akun_pendukung`
--

CREATE TABLE `build_akun_pendukung` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `name` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `content` text COLLATE latin1_general_ci DEFAULT NULL,
  `image` text COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_akun_pendukung`
--

INSERT INTO `build_akun_pendukung` (`id`, `name`, `alias`, `content`, `image`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('3511072021100026', 'FISIP CARE CENTER', 'fisip-care-center', '<strong>Lorem Ipsum</strong><span>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span>', '/bemfisipunpad/control/_filemanager/Akun_Pendukung/akun_fisipcarecenter.jpg', 'active', 1, '2021-07-11 10:00:26', '923072020160736', NULL, NULL),
('4511072021105603', 'Daily Story of Jatinangor', 'daily-story-of-jatinangor', '<strong>Lorem Ipsum</strong><span>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span>', '/bemfisipunpad/control/_filemanager/Akun_Pendukung/akun_dailystoryofjatinangor.jpg', 'active', 2, '2021-07-11 10:56:03', 'a1', '2021-07-13 07:33:51', 'a1');

-- --------------------------------------------------------

--
-- Table structure for table `build_biro_department`
--

CREATE TABLE `build_biro_department` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `name_dept_biro` text COLLATE latin1_general_ci DEFAULT NULL,
  `name_chairman` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `photo_chairman` text COLLATE latin1_general_ci DEFAULT NULL,
  `name_vice` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `photo_vice` text COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `type` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `department` varchar(100) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_biro_department`
--

INSERT INTO `build_biro_department` (`id`, `alias`, `name_dept_biro`, `name_chairman`, `photo_chairman`, `name_vice`, `photo_vice`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`, `type`, `department`) VALUES
('7312072021145101', 'departement-media-dan-informasi', 'Departement Media dan Informasi', 'Muhammad Hafizh S. S.', '/bemfisipunpad/control/_filemanager/photo/Medfo-Kadep-1.jpg', 'David Nathan Irvan A', '/bemfisipunpad/control/_filemanager/photo/Medfo-Wakadep.jpg', 'active', 2, '2021-07-12 14:51:01', 'a1', '2021-07-23 22:49:25', 'a1', 'department', 'sosial_politik'),
('7910072021211314', 'departemen-hubungan-masyarakat', 'Departemen Hubungan Masyarakat', 'Testing', '/bemfisipunpad/control/_filemanager/photo/ketua%20bem.png', 'Testing 2', '/bemfisipunpad/control/_filemanager/photo/wakil%20bem.png', 'active', 1, '2021-07-10 21:13:14', 'a1', '2021-07-23 22:42:00', 'a1', 'biro', '');

-- --------------------------------------------------------

--
-- Table structure for table `build_configuration`
--

CREATE TABLE `build_configuration` (
  `id` varchar(65) NOT NULL,
  `title_website` varchar(65) NOT NULL,
  `title_cms` varchar(65) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `updated_at` datetime NOT NULL,
  `updated_by` varchar(65) NOT NULL,
  `version` varchar(65) DEFAULT NULL,
  `jumlah_departementbiro` varchar(100) DEFAULT NULL,
  `jumlah_staff` varchar(100) DEFAULT NULL,
  `jumlah_programkerja` varchar(100) DEFAULT NULL,
  `jumlah_aksi` varchar(100) DEFAULT NULL,
  `jumlah_kajian` varchar(100) DEFAULT NULL,
  `jumlah_postinstagram` varchar(100) DEFAULT NULL,
  `link_instagram` varchar(100) DEFAULT NULL,
  `link_line` varchar(100) DEFAULT NULL,
  `link_twitter` varchar(100) DEFAULT NULL,
  `link_youtube` varchar(100) DEFAULT NULL,
  `link_dokumentasi` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_configuration`
--

INSERT INTO `build_configuration` (`id`, `title_website`, `title_cms`, `status`, `updated_at`, `updated_by`, `version`, `jumlah_departementbiro`, `jumlah_staff`, `jumlah_programkerja`, `jumlah_aksi`, `jumlah_kajian`, `jumlah_postinstagram`, `link_instagram`, `link_line`, `link_twitter`, `link_youtube`, `link_dokumentasi`) VALUES
('1', 'BEM FISIP Unpad', 'BEM FISIP Unpad', 'active', '2021-07-11 16:59:31', 'a1', NULL, '50', '40', '30', '20', '10', '80', 'https://www.instagram.com/himadpem.unpad/', 'https://line.id', 'https://www.twitter.com', 'https://www.youtube.com', 'https://drive.google.com/drive/u/1/folders/1tJquSqTYQYD1crrboRPaD7sv41qFse1A');

-- --------------------------------------------------------

--
-- Table structure for table `build_data_mahasiswa`
--

CREATE TABLE `build_data_mahasiswa` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `angkatan` varchar(255) DEFAULT NULL,
  `alias` varchar(255) NOT NULL,
  `jurusan` varchar(255) NOT NULL,
  `file` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `build_data_mahasiswa`
--

INSERT INTO `build_data_mahasiswa` (`id`, `name`, `angkatan`, `alias`, `jurusan`, `file`, `status`, `created_by`, `created_at`, `updated_at`, `updated_by`) VALUES
(2147483647, 'Data Mahasiswa', '2021', 'data-mahasiswa', 'Ilmu Pemerintahan', 'data-mahasiswa.pdf', 'active', 'a1', '2021-10-24 19:55:09', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_data_prestasi`
--

CREATE TABLE `build_data_prestasi` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `jurusan_angkatan` varchar(255) DEFAULT NULL,
  `prestasi` text DEFAULT NULL,
  `alias` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_by` varchar(255) NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `build_data_prestasi`
--

INSERT INTO `build_data_prestasi` (`id`, `name`, `jurusan_angkatan`, `prestasi`, `alias`, `status`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(2147483647, 'Muhammad Rizky', 'IP 2021', 'Peserta', 'muhammad-rizky', 'active', 'a1', '2021-10-24 12:10:53', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_faq`
--

CREATE TABLE `build_faq` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `questions` text COLLATE latin1_general_ci DEFAULT NULL,
  `answer` text COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_faq`
--

INSERT INTO `build_faq` (`id`, `questions`, `answer`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('4207072021201946', 'Bagaimana cara mengurus surat aktif mahasiswa, surat penelitian, dan keperluan kemahasiswaan lainnya?', '<ol>\r\n<li>AAAA</li>\r\n<li>BBBB</li>\r\n<li>CCCC</li>\r\n<li>DDDD</li>\r\n<li>EEEEE</li>\r\n<li>FFFFF</li>\r\n<li>GGGG</li>\r\n</ol>', 'active', 1, '2021-07-07 20:19:46', 'a1', '2021-07-12 20:13:32', 'a1');

-- --------------------------------------------------------

--
-- Table structure for table `build_himpunan_huria_mahasiswa_dan_ukm`
--

CREATE TABLE `build_himpunan_huria_mahasiswa_dan_ukm` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `name` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `content` text COLLATE latin1_general_ci DEFAULT NULL,
  `image` text COLLATE latin1_general_ci DEFAULT NULL,
  `link_instagram` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `category` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_himpunan_huria_mahasiswa_dan_ukm`
--

INSERT INTO `build_himpunan_huria_mahasiswa_dan_ukm` (`id`, `name`, `alias`, `content`, `image`, `link_instagram`, `category`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('1111072021211120', 'Young Investor', 'young-investor', '<strong>Lorem Ipsum</strong><span>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s,&nbsp;</span>', '/bemfisipunpad/control/_filemanager/organisasi_pendukung/Huria%20-%20Young%20Investor.png', 'https://www.instagram.com/himadpem.unpad/', 'huria', 'active', 2, '2021-07-11 21:11:20', 'a1', '2021-07-13 09:09:27', 'a1'),
('1112072021191444', 'Himpunan Mahasiswa Hubungan Internasional', 'himpunan-mahasiswa-hubungan-internasional', '-', '/bemfisipunpad/control/_filemanager/organisasi_pendukung/HM%20-%20HI.png', 'https://www.instagram.com/hmhiunpad/', 'himpunan', 'active', 3, '2021-07-12 19:14:44', 'a1', NULL, NULL),
('211072021210958', 'DKM FISIP Unpad', 'dkm-fisip-unpad', '-', '/bemfisipunpad/control/_filemanager/organisasi_pendukung/DKM.png', 'https://www.instagram.com/himadpem.unpad/', 'ukm', 'active', 1, '2021-07-11 21:09:58', 'a1', '2021-07-12 19:07:10', 'a1'),
('513072021144450', 'Futsal', 'futsal', '-', '/bemfisipunpad/control/_filemanager/organisasi_pendukung/Huria%20-%20ASFFU.png', 'https://www.instagram.com/futsal.unpad/', 'ukm', 'active', 4, '2021-07-13 14:44:50', 'a1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_kategori_dokumentasi`
--

CREATE TABLE `build_kategori_dokumentasi` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `title` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `photo` text COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_kategori_dokumentasi`
--

INSERT INTO `build_kategori_dokumentasi` (`id`, `title`, `alias`, `photo`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('607072021203011', 'Aksi Kamisan', 'aksi-kamisan', NULL, 'active', 1, '2021-07-07 20:30:11', 'a1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_list_dokumentasi`
--

CREATE TABLE `build_list_dokumentasi` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `title` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `content` text COLLATE latin1_general_ci DEFAULT NULL,
  `photo` text COLLATE latin1_general_ci DEFAULT NULL,
  `category` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_list_dokumentasi`
--

INSERT INTO `build_list_dokumentasi` (`id`, `title`, `alias`, `content`, `photo`, `category`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('5007072021203536', 'May Days', 'may-days', NULL, 'd_EF109E31CC1FC3D9287428CA2A4693E3.jpeg', '607072021203011', 'active', 1, '2021-07-07 20:35:36', 'a1', '2021-07-07 20:36:37', 'a1');

-- --------------------------------------------------------

--
-- Table structure for table `build_list_donasi`
--

CREATE TABLE `build_list_donasi` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `metode_bayar` varchar(255) DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `is_private` enum('yes','no') DEFAULT NULL,
  `status` enum('Sukses','Pending') NOT NULL,
  `created_at` date DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_at` date DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `build_list_donasi`
--

INSERT INTO `build_list_donasi` (`id`, `nama`, `metode_bayar`, `jumlah`, `catatan`, `is_private`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
(2147483647, 'Muhammad Rizky', '2147483647', 10531, 'semoga berkah', 'no', 'Pending', '2021-11-01', 'a1', '2021-11-01', 'a1');

-- --------------------------------------------------------

--
-- Table structure for table `build_list_position`
--

CREATE TABLE `build_list_position` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `title` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `position` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_list_position`
--

INSERT INTO `build_list_position` (`id`, `title`, `alias`, `position`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('2610072021203345', 'Ketua BEM FISIP Unpad', 'ketua-bem-fisip-unpad', 'pimkab', 'active', 1, '2021-07-10 20:33:45', 'a1', '2021-07-12 16:48:35', 'a1'),
('6610072021203416', 'Sekretaris Umum BEM FISIP Unpad', 'sekretaris-umum-bem-fisip-unpad', 'pimkab', 'active', 3, '2021-07-10 20:34:16', 'a1', '2021-07-12 16:48:53', 'a1'),
('6910072021203407', 'Wakil Ketua BEM FISIP Unpad', 'wakil-ketua-bem-fisip-unpad', 'pimkab', 'active', 2, '2021-07-10 20:34:07', 'a1', '2021-07-12 16:48:43', 'a1');

-- --------------------------------------------------------

--
-- Table structure for table `build_list_sosial_media`
--

CREATE TABLE `build_list_sosial_media` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `title` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `icon` text COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_list_sosial_media`
--

INSERT INTO `build_list_sosial_media` (`id`, `title`, `alias`, `icon`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('4409072021160506', 'Instagram', 'instagram', '/bemfisipunpad/control/_filemanager/medsos/Icon%20simple-instagram.png', 'active', 3, '2021-07-09 16:05:06', 'a1', NULL, NULL),
('709072021160434', 'Shopee', 'shopee', '/bemfisipunpad/control/_filemanager/medsos/icons8-shopee-250.png', 'active', 2, '2021-07-09 16:04:34', 'a1', NULL, NULL),
('7209072021160356', 'Line', 'line', '/bemfisipunpad/control/_filemanager/medsos/Icon%20simple-instagram.png', 'active', 1, '2021-07-09 16:03:56', 'a1', NULL, NULL),
('8509072021160656', 'Tiktok', 'tiktok', '/bemfisipunpad/control/_filemanager/medsos/Icon%20simple-tiktok.png', 'active', 4, '2021-07-09 16:06:56', 'a1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_metode_pembayaran`
--

CREATE TABLE `build_metode_pembayaran` (
  `id` int(11) NOT NULL,
  `bank` varchar(255) NOT NULL,
  `rekening` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` date NOT NULL,
  `updated_by` varchar(255) NOT NULL,
  `updated_at` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `build_metode_pembayaran`
--

INSERT INTO `build_metode_pembayaran` (`id`, `bank`, `rekening`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(2147483647, 'BRI', '2831\r\nAN RIZKY', 'a1', '2021-11-01', 'a1', '2021-11-01 11:57:57');

-- --------------------------------------------------------

--
-- Table structure for table `build_page`
--

CREATE TABLE `build_page` (
  `id` varchar(65) NOT NULL,
  `tobe` varchar(65) NOT NULL,
  `category` varchar(65) NOT NULL,
  `name` text NOT NULL,
  `alias` text NOT NULL,
  `setup` varchar(65) NOT NULL,
  `file_name` text NOT NULL,
  `target` varchar(65) NOT NULL,
  `publish` varchar(65) NOT NULL,
  `link` text NOT NULL,
  `reorder` int(11) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` varchar(65) NOT NULL,
  `updated_at` datetime NOT NULL,
  `updated_by` varchar(65) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_page`
--

INSERT INTO `build_page` (`id`, `tobe`, `category`, `name`, `alias`, `setup`, `file_name`, `target`, `publish`, `link`, `reorder`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('2112072021185637', 'parent', '', 'Himpunan & UKM', 'himpunan-ukm', 'internal', 'himpunan.html', 'blank', 'show', '', 8, 'inactive', '2021-07-12 18:56:37', 'a1', '2021-07-13 16:17:59', 'a1'),
('2211072021162241', 'parent', '', 'Beranda', 'home', 'internal', 'index.html', 'blank', 'show', '', 1, 'active', '2021-07-11 16:22:41', 'a1', '0000-00-00 00:00:00', ''),
('3112072021172623', 'parent', '', 'Pendukung', 'pendukung', 'internal', 'pendukung.html', 'self', 'show', '', 3, 'active', '2021-07-12 17:26:23', 'a1', '0000-00-00 00:00:00', ''),
('3512072021193133', 'parent', '', 'Dokumentasi', 'dokumentasi', 'internal', 'dokumentasi.html', 'blank', 'show', '', 6, 'active', '2021-07-12 19:31:33', 'a1', '0000-00-00 00:00:00', ''),
('3712072021145900', 'parent', '', 'Tentang Kami', 'tentang-kami', 'internal', 'tentangkami.html', 'self', 'show', '', 2, 'active', '2021-07-12 14:59:00', 'a1', '0000-00-00 00:00:00', ''),
('6712072021200327', 'parent', '', 'FAQ', 'faq', 'internal', 'faq.html', 'blank', 'show', '', 7, 'active', '2021-07-12 20:03:27', 'a1', '0000-00-00 00:00:00', ''),
('7212072021192524', 'parent', '', 'UKM', 'ukm', 'internal', 'ukm.html', 'blank', 'show', '', 5, 'inactive', '2021-07-12 19:25:24', 'a1', '0000-00-00 00:00:00', '');

-- --------------------------------------------------------

--
-- Table structure for table `build_pimpinan_kabinet`
--

CREATE TABLE `build_pimpinan_kabinet` (
  `id` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `name` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `alias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `photo` text COLLATE latin1_general_ci DEFAULT NULL,
  `position` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_pimpinan_kabinet`
--

INSERT INTO `build_pimpinan_kabinet` (`id`, `name`, `alias`, `photo`, `position`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('3910072021204726', 'Armelin Yudianti', 'armelin-yudianti', '/bemfisipunpad/control/_filemanager/photo/sekretaris%20bem.png', '6610072021203416', 'active', 3, '2021-07-10 20:47:26', 'a1', NULL, NULL),
('6710072021204252', 'Rayhan Muhammad F', 'rayhan-muhammad-f', '/bemfisipunpad/control/_filemanager/photo/wakil%20bem.png', '6910072021203407', 'active', 2, '2021-07-10 20:42:52', 'a1', NULL, NULL),
('8310072021203701', 'Virdian Aurellio Hartano', 'virdian-aurellio-hartano', '/bemfisipunpad/control/_filemanager/photo/ketua%20bem.png', '2610072021203345', 'active', 1, '2021-07-10 20:37:01', 'a1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_privileges`
--

CREATE TABLE `build_privileges` (
  `id` varchar(65) COLLATE latin1_general_ci NOT NULL,
  `icon` varchar(65) COLLATE latin1_general_ci NOT NULL,
  `name` varchar(65) COLLATE latin1_general_ci NOT NULL,
  `alias` varchar(65) COLLATE latin1_general_ci NOT NULL,
  `status` enum('active','inactive') COLLATE latin1_general_ci NOT NULL,
  `reorder` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_privileges`
--

INSERT INTO `build_privileges` (`id`, `icon`, `name`, `alias`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('1220072020105554', 'fa-cog', 'Tools', 'system', 'active', 5, '2020-07-20 10:55:54', 'a1', '2020-07-27 04:50:21', 'a1'),
('2120072020105522', 'fa-database', 'Master Data', 'master-data', 'active', 2, '2020-07-20 10:55:22', 'a1', NULL, NULL),
('3809072021145543', 'fa-bookmark', 'Mix Data', 'mix-data', 'active', 6, '2021-07-09 14:55:43', 'a1', '2021-07-09 14:57:55', 'a1'),
('522102021160122', 'fa-list', 'RDA', 'RDA', 'active', 7, '2021-10-22 16:01:22', 'a1', '2021-10-22 16:03:11', 'a1'),
('530102021172109', 'fa-money', 'Donasi', 'donasi', 'active', 8, '2021-10-30 17:21:09', 'a1', NULL, NULL),
('6907072021201100', 'fa-camera', 'Dokumentasi', 'dokumentasi', 'active', 4, '2021-07-07 20:11:00', 'a1', NULL, NULL),
('9020072020104643', 'fa-user', 'User', 'user', 'active', 1, '2020-07-20 10:46:43', 'a1', '0000-00-00 00:00:00', ''),
('9807072021150405', 'fa-users', 'Struktur Organisasi', 'struktur-organisasi', 'active', 3, '2021-07-07 15:04:05', 'a1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_privileges_acc`
--

CREATE TABLE `build_privileges_acc` (
  `id` varchar(65) NOT NULL,
  `name` varchar(65) NOT NULL,
  `alias` varchar(65) NOT NULL,
  `reorder` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `created_by` varchar(65) NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_privileges_acc`
--

INSERT INTO `build_privileges_acc` (`id`, `name`, `alias`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`, `status`) VALUES
('2920072020151242', 'Delete', 'DEL', 4, '2020-07-20 15:12:42', 'a1', NULL, NULL, 'active'),
('5820072020151210', 'Update', 'UPDT', 2, '2020-07-20 15:12:10', 'a1', NULL, NULL, 'active'),
('6521072020144135', 'Change Password', 'CP', 5, '2020-07-21 14:41:35', 'a1', NULL, NULL, 'active'),
('9420072020151115', 'Create', 'CRT', 1, '2020-07-20 15:11:15', 'a1', '2020-07-20 15:11:57', 'a1', 'active'),
('9420072020151229', 'View', 'DSPL', 3, '2020-07-20 15:10:29', 'a1', NULL, NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `build_privileges_item`
--

CREATE TABLE `build_privileges_item` (
  `id` varchar(65) NOT NULL,
  `name` varchar(65) NOT NULL,
  `alias` varchar(65) NOT NULL,
  `id_priv` varchar(65) NOT NULL,
  `id_priv_acc` text NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `reorder` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` varchar(65) NOT NULL,
  `updated_at` datetime NOT NULL,
  `updated_by` varchar(65) NOT NULL,
  `defaults` enum('yes','no') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_privileges_item`
--

INSERT INTO `build_privileges_item` (`id`, `name`, `alias`, `id_priv`, `id_priv_acc`, `status`, `reorder`, `created_at`, `created_by`, `updated_at`, `updated_by`, `defaults`) VALUES
('1621072020144203', 'User', 'user', '9020072020104643', '2920072020151242,5820072020151210,6521072020144135,9420072020151115,9420072020151229', 'active', 1, '2020-07-21 14:42:03', 'a1', '0000-00-00 00:00:00', '', 'yes'),
('1709072021143034', 'Akun Pendukung', 'akun_pendukung', '2120072020105522', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 11, '2021-07-09 14:30:34', 'a1', '0000-00-00 00:00:00', '', 'no'),
('209072021150026', 'List Sosial Media', 'list_sosial_media', '3809072021145543', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 12, '2021-07-09 15:00:26', 'a1', '0000-00-00 00:00:00', '', 'no'),
('324102021085422', 'Data Mahasiswa', 'data_mahasiswa', '522102021160122', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 17, '2021-10-24 08:54:22', 'a1', '0000-00-00 00:00:00', '', 'no'),
('3421072020144622', 'Vocabulary', 'vocabulary', '1220072020105554', '2920072020151242,5820072020151210,9420072020151115,9420072020151229', 'active', 3, '2020-07-21 14:46:22', 'a1', '2020-07-24 06:39:31', 'a1', 'yes'),
('3521072020144442', 'Role', 'role', '9020072020104643', '2920072020151242,5820072020151210,9420072020151115,9420072020151229', 'active', 2, '2020-07-21 14:44:42', 'a1', '0000-00-00 00:00:00', '', 'yes'),
('3810072021210026', 'Biro Department', 'biro_department', '9807072021150405', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 15, '2021-07-10 21:00:25', 'a1', '0000-00-00 00:00:00', '', 'no'),
('3824102021120147', 'Data Prestasi', 'data_prestasi', '522102021160122', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 18, '2021-10-24 12:01:47', 'a1', '0000-00-00 00:00:00', '', 'no'),
('3829072021110015', 'Link Dokumentasi', 'link_dokumentasi', '6907072021201100', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 16, '2021-07-29 11:00:15', 'a1', '0000-00-00 00:00:00', '', 'no'),
('4901112021111848', 'Metode Pembayaran', 'metode_pembayaran', '530102021172109', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 19, '2021-11-01 11:18:48', 'a1', '0000-00-00 00:00:00', '', 'no'),
('5407072021201450', 'FAQ', 'faq', '2120072020105522', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 8, '2021-07-07 20:14:50', 'a1', '0000-00-00 00:00:00', '', 'no'),
('6707072021195612', 'Akun Media Sosial', 'akun_media_sosial', '2120072020105522', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 7, '2021-07-07 19:56:12', 'a1', '0000-00-00 00:00:00', '', 'no'),
('6707072021202322', 'Kategori Dokumentasi', 'kategori_dokumentasi', '6907072021201100', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 9, '2021-07-07 20:23:22', 'a1', '0000-00-00 00:00:00', '', 'no'),
('7507072021202642', 'List Dokumentasi', 'list_dokumentasi', '6907072021201100', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 10, '2021-07-07 20:26:42', 'a1', '0000-00-00 00:00:00', '', 'no'),
('8610072021200006', 'Pimpinan Kabinet', 'pimpinan_kabinet', '9807072021150405', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 13, '2021-07-10 20:00:06', 'a1', '0000-00-00 00:00:00', '', 'no'),
('9230072020230604', 'Media', 'media', '1220072020105554', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 5, '2020-07-30 23:06:04', 'a1', '0000-00-00 00:00:00', '', 'yes'),
('9407072021185222', 'Himpunan Huria Mahasiswa dan UKM', 'himpunan_huria_mahasiswa_dan_ukm', '2120072020105522', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 6, '2021-07-07 18:52:22', 'a1', '0000-00-00 00:00:00', '', 'no'),
('9710072021202639', 'List Position', 'list_position', '3809072021145543', '9420072020151229,9420072020151115,5820072020151210,2920072020151242', 'active', 14, '2021-07-10 20:26:39', 'a1', '0000-00-00 00:00:00', '', 'no'),
('9901112021113327', 'List Donasi', 'list_donasi', '530102021172109', '9420072020151229,5820072020151210,2920072020151242', 'active', 20, '2021-11-01 11:33:27', 'a1', '0000-00-00 00:00:00', '', 'no');

-- --------------------------------------------------------

--
-- Table structure for table `build_role`
--

CREATE TABLE `build_role` (
  `id` varchar(65) NOT NULL,
  `name` varchar(65) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_role`
--

INSERT INTO `build_role` (`id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('7417072020162238', 'admins', '2020-07-17 16:22:38', 'a1', '2020-07-26 11:00:42', 'a1'),
('7806072020184053', 'Admin', '2020-07-06 18:40:54', 'a1', '2021-07-11 09:53:58', 'a1');

-- --------------------------------------------------------

--
-- Table structure for table `build_role_detail`
--

CREATE TABLE `build_role_detail` (
  `id` varchar(65) NOT NULL,
  `id_role` varchar(65) DEFAULT NULL,
  `page` varchar(65) DEFAULT NULL,
  `role` varchar(65) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_role_detail`
--

INSERT INTO `build_role_detail` (`id`, `id_role`, `page`, `role`) VALUES
('016811072021095359', '7806072020184053', 'vocabulary', 'CRT'),
('075111072021095358', '7806072020184053', 'user', 'DEL'),
('086011072021095359', '7806072020184053', 'akun_pendukung', 'DSPL'),
('098326072020110043', '7417072020162238', 'role', 'DEL'),
('118611072021095359', '7806072020184053', 'akun_pendukung', 'CRT'),
('166511072021095358', '7806072020184053', 'user', 'UPDT'),
('169526072020110043', '7417072020162238', 'role', 'UPDT'),
('18011072021095359', '7806072020184053', 'vocabulary', 'DSPL'),
('242411072021095358', '7806072020184053', 'user', 'CP'),
('257711072021095359', '7806072020184053', 'akun_pendukung', 'UPDT'),
('298526072020110043', '7417072020162238', 'role', 'CRT'),
('333711072021095359', '7806072020184053', 'akun_pendukung', 'DEL'),
('37226072020110043', '7417072020162238', 'role', 'DSPL'),
('386811072021095359', '7806072020184053', 'user', 'CRT'),
('495111072021095359', '7806072020184053', 'user', 'DSPL');

-- --------------------------------------------------------

--
-- Table structure for table `build_sosmed_pendukung`
--

CREATE TABLE `build_sosmed_pendukung` (
  `id` varchar(65) COLLATE latin1_general_ci NOT NULL,
  `id_akun_pendukung` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `id_sosmed` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `link` text COLLATE latin1_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `build_sosmed_pendukung`
--

INSERT INTO `build_sosmed_pendukung` (`id`, `id_akun_pendukung`, `id_sosmed`, `link`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('10011072021100026-ids', '3511072021100026', '709072021160434', 'https://line.com', '2021-07-11 10:00:26', '923072020160736', NULL, NULL),
('8711072021100026-ids', '3511072021100026', '7209072021160356', 'https://google_1.com', '2021-07-11 10:00:26', '923072020160736', NULL, NULL),
('911072021105603-ids', '4511072021105603', '7209072021160356', 'https://google_1.com', '2021-07-11 10:56:03', 'a1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `build_user`
--

CREATE TABLE `build_user` (
  `id` varchar(65) NOT NULL,
  `name` varchar(65) NOT NULL,
  `email` varchar(65) NOT NULL,
  `username` varchar(65) NOT NULL,
  `password` text NOT NULL,
  `photo` text NOT NULL,
  `id_role` varchar(65) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` varchar(65) NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) DEFAULT NULL,
  `reorder` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_user`
--

INSERT INTO `build_user` (`id`, `name`, `email`, `username`, `password`, `photo`, `id_role`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`, `reorder`) VALUES
('923072020160736', 'bagas', 'bagaskawan@gmail.com', 'bagaskawan', '3dce7752975ea678c8bd03a58ebf7a46', 'u_50C1C5696F1D882AEF5FDBB4BFF395CA.jpg', '7806072020184053', 'inactive', '2020-07-23 16:07:36', 'a1', '2020-07-25 03:40:19', '923072020160736', 4),
('a1', 'Admin Master', 'adminmaster@mail.com', 'admin', '0d2c12a917641483e00277cb0b92c4d7', 'u_018DAC0A235960C828DBB7F71B8F162E.jpg', 'a1', 'active', '2020-07-25 03:46:51', '923072020160736', '2021-07-11 15:26:58', 'a1', 17);

-- --------------------------------------------------------

--
-- Table structure for table `build_vocab`
--

CREATE TABLE `build_vocab` (
  `id` varchar(65) NOT NULL,
  `name` varchar(65) DEFAULT NULL,
  `alias` varchar(65) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(65) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(65) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL,
  `reorder` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `build_vocab`
--

INSERT INTO `build_vocab` (`id`, `name`, `alias`, `created_at`, `created_by`, `updated_at`, `updated_by`, `status`, `reorder`) VALUES
('1', 'Nama', 'name', '2016-07-20 11:15:38', 'a1', '2021-07-11 10:13:43', 'a1', 'active', 0),
('10', 'Re Password', 'repassword', '2016-07-20 11:28:42', 'a1', '2016-07-20 11:28:43', '', 'active', 0),
('10004102016115535', 'Jawaban', 'answer', '2016-10-04 16:55:35', 'a1', '2021-07-11 10:19:32', 'a1', 'active', 0),
('10010102016093819', 'Year', 'year', '2016-10-10 14:38:19', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('10016112018144622', 'Field', 'field', '2018-11-16 14:46:22', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('10024102021120214', 'Jurusan & Angkatan', 'jurusan_angkatan', '2021-10-24 12:02:14', 'a1', NULL, NULL, 'active', 0),
('1012122018095853', 'Railing', 'railing', '2018-12-12 09:58:53', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('1025072020044947', 'Role', 'role', '2020-07-25 04:49:46', '923072020160736', '2020-07-27 11:18:47', 'a1', 'active', 0),
('103', 'Send', 'send', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('104', 'Photo', 'photo', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('105', 'signup', 'signup', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('108', 'Copy', 'copy', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('11', 'Email', 'email', '2016-07-20 11:29:01', 'a1', '2016-07-20 11:29:02', '', 'active', 0),
('117', 'signin', 'signin', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('118', 'Username/Password Invalid', 'login_invalid', '2016-07-27 11:38:16', 'a1', '2016-08-11 14:17:15', 'a1', 'active', 0),
('119', 'Login', 'login', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('12', 'Submit', 'submit', '2016-07-20 11:29:31', 'a1', '2016-07-20 11:29:32', '', 'active', 0),
('120', 'Username', 'username', '2016-07-27 11:38:16', 'a1', '2016-10-27 16:59:46', 'a1', 'active', 0),
('1211012019161656', 'Last Name', 'last_name', '2019-01-11 16:16:56', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('1211122018151303', 'Sub Titile', 'sub_title', '2018-12-11 15:13:03', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('122', 'Accepted', 'accept', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('13', 'Cancel', 'cancel', '2016-07-20 11:29:53', 'a1', '2016-07-20 11:29:55', '', 'active', 0),
('131', 'Logout Succesfully', 'logout-succesfully', '2016-07-27 11:38:16', 'a1', '2020-07-25 02:39:30', 'a1', 'active', 0),
('1311082018093249', 'Hide', 'hide', '2018-08-11 14:32:49', '1811102016044913', '0000-00-00 00:00:00', '', 'active', 0),
('1312112018140707', 'Price', 'price', '2018-11-12 14:07:07', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('1312122018110857', 'Floor Plan 2', 'floor_plan2', '2018-12-12 11:08:57', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('132', 'Member', 'member', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('1330062020143822', 'Link Twitter', 'link_twitter', '2020-06-30 19:38:22', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('135', 'Back', 'back', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('14', 'Gambar', 'image', '2016-07-20 11:29:53', 'a1', '2021-07-11 10:15:46', 'a1', 'active', 0),
('1407072021175605', 'Jumlah Aksi', 'jumlah_aksi', '2021-07-07 17:56:05', 'a1', NULL, NULL, 'active', 0),
('1429072021110816', 'Link Dokumentasi', 'link_dokumentasi', '2021-07-29 11:08:16', 'a1', '2021-07-29 11:10:32', 'a1', 'active', 0),
('147', 'Data has been update', 'update', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('15', 'Biodata', 'biodata', '2016-07-20 11:32:05', 'a1', '2016-07-20 11:32:05', '', 'active', 0),
('158', 'Validation', 'validation', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('16', 'Role', 'rule', '2016-07-20 11:32:05', 'a1', '2016-08-12 13:58:33', 'a1', 'active', 0),
('1630062020135758', 'Link Instagram', 'link_instagram', '2020-06-30 18:57:58', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('17', 'Select', 'select', '0000-00-00 00:00:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('1704082018021019', 'Edit', 'edit', '2018-08-04 07:10:19', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('171', '404 Page Not Found.', '404', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('1713122018133256', 'Longitude', 'lng', '2018-12-13 13:32:56', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('18', 'Language', 'lang', '2016-07-20 13:58:39', 'a1', '2016-07-20 13:58:40', '', 'active', 0),
('1812122018112913', 'Price List', 'price_list', '2018-12-12 11:29:13', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('1825012021085112', 'Publikasi', 'jurnal', '2021-01-25 08:51:12', 'a1', '2021-01-25 09:35:03', 'a1', 'active', 0),
('19', 'No Data to Display', 'nodata', '2016-07-20 14:07:51', 'a1', '2016-07-20 14:07:52', '', 'active', 0),
('1910072021203027', 'Pimpinan Kabinet', 'pimkab', '2021-07-10 20:30:27', 'a1', NULL, NULL, 'active', 0),
('1911082020201853', 'a', 'a', '2020-08-11 20:18:53', 'a1', NULL, NULL, 'active', 0),
('2', 'Status', 'status', '2016-07-20 11:29:53', 'a1', '2016-07-20 11:29:53', '', 'active', 0),
('20', 'Create data', 'create', '2016-07-20 14:14:19', 'a1', '2016-07-20 14:14:20', '', 'active', 0),
('2027102016120117', 'Re New Password', 're_password', '2016-10-27 17:01:17', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('21', 'Are you sure to delete data...???', 'confirm_delete', '2016-07-20 15:40:10', 'a1', '2016-07-20 15:40:12', '', 'active', 0),
('2112102016050336', 'From', 'from', '2016-10-12 10:03:36', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('212122018100025', 'Sanitair', 'sanitair', '2018-12-12 10:00:25', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('214082018194314', '.zip - max file sizes 5Mb', '.zip - max file sizes 5Mb', '2018-08-14 19:43:14', 'a1', '2018-08-14 19:43:34', 'a1', 'active', 0),
('22', 'Delete data', 'delete', '0000-00-00 00:00:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('23', 'Required', 'require', '2016-07-20 16:42:08', 'a1', '2016-08-12 15:56:04', 'a1', 'active', 0),
('2307072021175527', 'Jumlah Staff', 'jumlah_staff', '2021-07-07 17:55:27', 'a1', NULL, NULL, 'active', 0),
('24', 'Error', 'error', '2016-07-20 16:51:11', 'a1', '2016-07-20 16:51:10', '', 'active', 0),
('2412122018111939', 'Length', 'length', '2018-12-12 11:19:39', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('2416072021162426', 'Sosial Politik', 'sosial_politik', '2021-07-16 16:24:26', 'a1', NULL, NULL, 'active', 0),
('2419012021184121', 'Jumlah Alumni', 'jumlah_alumni', '2021-01-19 18:41:21', 'a1', NULL, NULL, 'active', 0),
('25', 'Role empty, please select one role first', 'rule_empty', '2016-07-21 11:04:27', 'a1', '2016-08-12 13:46:57', 'a1', 'active', 0),
('2501112021114041', 'Privasi', 'Privasi', '2021-11-01 11:40:41', 'a1', NULL, NULL, 'active', 0),
('2504082018020718', 'Diupdate Oleh', 'updated_by', '2018-08-04 07:07:18', 'a1', '2021-07-11 10:37:06', 'a1', 'active', 0),
('2510072021203039', 'Department Biro', 'dept_biro', '2021-07-10 20:30:39', 'a1', NULL, NULL, 'active', 0),
('26', 'Success', 'success', '2016-07-22 10:16:45', 'a1', '2016-07-22 10:16:45', '', 'active', 0),
('2611102016054729', 'Page', 'id_page', '2016-10-11 10:47:29', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('2613122018143201', 'Facilities', 'title_facilities', '2018-12-13 14:32:01', 'a1', '2018-12-13 14:32:27', 'a1', 'active', 0),
('2629072020162955', 'Vocab', 'vocab', '2020-07-29 16:29:55', 'a1', '2020-08-07 10:09:08', 'a1', 'active', 0),
('27', 'Warning', 'warning', '2016-07-22 10:17:13', 'a1', '2016-07-22 10:17:14', '', 'active', 0),
('2701112016051211', 'Search ...', 'search', '2016-11-01 11:12:11', 'a1', '2016-11-01 11:12:34', 'a1', 'active', 0),
('2710102016084646', 'Subject', 'subject', '2016-10-10 13:46:46', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('2712122018095838', 'Plafond', 'plafond', '2018-12-12 09:58:38', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('2712122018095948', 'Another Door', 'another_door', '2018-12-12 09:59:48', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('28', 'Please checked option(s) first', 'opt_first', '0000-00-00 00:00:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('2803082018120342', 'Action', 'aksi', '2018-08-03 17:03:42', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('2809112018192720', 'Series Product', 'series_product', '2018-11-09 19:27:20', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('2817112018182143', 'form was sent successfully', 'form_success', '2018-11-17 18:21:43', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('29', 'School', 'school', '2016-07-22 11:08:35', 'a1', '2016-07-22 11:08:36', '', 'active', 0),
('3', 'Role', 'role_model', '2016-07-20 11:29:53', 'a1', '2016-08-12 14:02:11', 'a1', 'active', 0),
('30', 'Judul', 'title', '2016-07-22 13:55:44', 'a1', '2021-07-11 10:13:52', 'a1', 'active', 0),
('3016072021162413', 'Relasi Kemasyarakatan', 'relasi_kemasyarakatan', '2021-07-16 16:24:13', 'a1', NULL, NULL, 'active', 0),
('305102016092922', 'Question', 'question', '2016-10-05 14:29:22', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('31', 'Isi', 'content', '2016-07-22 14:00:21', 'a1', '2021-07-11 10:18:53', 'a1', 'active', 0),
('3112102016053531', 'Message', 'message', '2016-10-12 10:35:31', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('312122018100046', 'Water Type', 'water_type', '2018-12-12 10:00:46', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('32', 'Profile', 'profile', '2016-07-22 16:16:48', 'a1', '2016-07-22 16:16:49', '', 'active', 0),
('3213112018114116', 'Specification', 'specification', '2018-11-13 11:41:16', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3227102016124042', 'One Page', 'onepage', '2016-10-27 17:40:42', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('326102016103551', 'File', 'file', '2016-10-26 15:35:51', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('33', 'View site', 'viewsite', '2016-07-22 16:17:26', 'a1', '2016-07-22 16:17:27', '', 'active', 0),
('3301112021110049', 'BCA', 'bca', '2021-11-01 11:00:49', 'a1', NULL, NULL, 'active', 0),
('3306102016112952', 'Start Date', 'start_date', '2016-10-06 16:29:52', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3307072021175546', 'Jumlah Program Kerja', 'jumlah_programkerja', '2021-07-07 17:55:46', 'a1', NULL, NULL, 'active', 0),
('3307082018105411', 'Company', 'company', '2018-08-07 15:54:11', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3309122019135521', 'Kategori', 'kategori', '2019-12-09 19:55:21', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3312122018112923', 'Brochure', 'brochure', '2018-12-12 11:29:23', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3312122018143721', 'Image Room', 'image_room', '2018-12-12 14:37:21', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3314012019131451', 'Residence', 'residence', '2019-01-14 13:14:51', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3316072021163753', 'Department', 'depart', '2021-07-16 16:37:53', 'a1', NULL, NULL, 'active', 0),
('34', 'User', 'user', '2016-07-22 16:17:45', 'a1', '2016-07-22 16:17:45', '', 'active', 0),
('3404102016104653', 'Woman', 'woman', '2016-10-04 15:46:53', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3412072021144902', 'Tipe', 'type', '2021-07-12 14:49:02', 'a1', NULL, NULL, 'active', 0),
('3425012021085103', 'Penulis', 'penulis', '2021-01-25 08:51:03', 'a1', NULL, NULL, 'active', 0),
('35', 'Preference', 'preference', '0000-00-00 00:00:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3520012021214549', 'Child', 'child', '2021-01-20 21:45:49', 'a1', NULL, NULL, 'active', 0),
('36', 'Logout', 'logout', '0000-00-00 00:00:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3627112018161209', 'Logo', 'logo', '2018-11-27 16:12:09', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('37', 'Title Website', 'title_website', '2016-07-22 16:22:16', 'a1', '2016-07-22 16:22:17', '', 'active', 0),
('3725012021085156', 'Tingkat', 'skala', '2021-01-25 08:51:56', 'a1', '2021-01-25 09:35:34', 'a1', 'active', 0),
('38', 'Under Construction', 'under', '2016-07-22 16:25:09', 'a1', '2016-07-22 16:25:10', '', 'active', 0),
('3808122019115414', 'Twitter', 'twitter', '2019-12-08 17:54:14', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('3816082018110009', 'Longitude', 'lng', '2018-08-16 11:00:09', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('39', 'Online', 'online', '2016-07-22 16:25:40', 'a1', '2016-07-22 16:25:41', '', 'active', 0),
('3907072021175621', 'Jumlah Kajian', 'jumlah_kajian', '2021-07-07 17:56:21', 'a1', NULL, NULL, 'active', 0),
('3908102016090739', 'Internal', 'internal', '2016-10-08 14:07:39', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4', 'Post By', 'postby', '2016-07-20 11:17:52', 'a1', '2016-07-20 11:17:53', '', 'active', 0),
('4002082018090748', 'Diupdate Pada', 'updated_at', '2018-08-02 14:07:48', 'a1', '2021-07-11 10:37:21', 'a1', 'active', 0),
('401112021120344', 'Pending', 'Pending', '2021-11-01 12:03:44', 'a1', '2021-11-01 12:03:54', 'a1', 'active', 0),
('4013112018131257', 'Sub', 'sub', '2018-11-13 13:12:57', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4016042021174118', 'Produk', 'produk', '2021-04-16 17:41:18', 'a1', NULL, NULL, 'active', 0),
('4023082016113105', 'id', 'en', '2016-08-23 16:31:05', 'a1', '2016-08-23 16:48:50', 'a1', 'active', 0),
('411082020202050', 'b', 'b', '2020-08-11 20:20:50', 'a1', NULL, NULL, 'active', 0),
('413112018131313', 'Series', 'series', '2018-11-13 13:13:13', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('416112018135209', 'Attention', 'attention', '2018-11-16 13:52:09', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4201112021112427', 'bank', 'bank', '2021-11-01 11:24:27', 'a1', NULL, NULL, 'active', 0),
('4220082016054906', 'Current Quota', 'current_quota', '2016-08-18 11:44:24', 'a1', '2016-08-20 10:51:38', 'a1', 'active', 0),
('4227102016124609', 'Menu', 'menu', '2016-10-27 17:46:09', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4230082018142553', 'Modify Data', 'modify', '2018-08-30 14:25:53', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4305102016093620', 'Self', 'self', '2016-10-05 14:36:20', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4310072021122604', 'Media Sosial', 'media_sosial', '2021-07-10 12:26:04', 'a1', NULL, NULL, 'active', 0),
('4331102016042900', 'Address', 'address', '2016-10-31 10:29:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4411122018160047', 'Image Slide', 'image_slide', '2018-12-11 16:00:47', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4511072021134836', 'Sorry, your account is disabled', 'login-disabled', '2021-07-11 13:48:36', 'a1', NULL, NULL, 'active', 0),
('4514082018194144', 'CV', 'cv', '2018-08-14 19:41:44', 'a1', '2018-08-15 09:21:43', 'a1', 'active', 0),
('4520072020121208', 'Privileges', 'privileges', '2020-07-20 12:12:08', 'a1', NULL, NULL, 'active', 0),
('45698793453165', 'Show All', 'showall', '0000-00-00 00:00:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('45698793453167', 'Check to Remove', 'check_to_remove', '0000-00-00 00:00:00', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('47', 'Alias', 'alias', '2016-07-27 09:41:39', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4701112021111124', 'jumlah', 'jumlah', '2021-11-01 11:11:24', 'a1', NULL, NULL, 'active', 0),
('4702082018085808', 'identity', 'identity', '2018-08-02 13:58:08', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4710072021151012', 'Social Media', 'social_media', '2021-07-10 15:10:12', 'a1', NULL, NULL, 'active', 0),
('4713082016092016', 'invitation', 'invitation_link', '2016-08-13 10:16:48', 'a1', '2016-08-13 14:20:34', 'a1', 'active', 0),
('4716042021173746', 'video', 'video', '2021-04-16 17:37:46', 'a1', NULL, NULL, 'active', 0),
('4730082018094053', 'Expired Date', 'expired_date', '2018-08-30 09:40:53', 'a1', '2018-08-30 09:41:41', 'a1', 'active', 0),
('48', 'Home', 'home', '2016-07-27 11:12:57', 'a1', '2016-07-27 11:12:58', '', 'active', 0),
('4807102016083908', 'Meta Description', 'meta_desc', '2016-10-07 13:39:08', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4809112018192702', 'Sub Product', 'sub_product', '2018-11-09 19:27:02', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('4913082016092715', 'Download', 'download', '2016-08-13 13:15:32', 'a1', '2016-08-13 14:27:25', 'a1', 'active', 0),
('4922082016045408', 'Print PDPE', 'print_pdpe', '2016-08-22 09:54:08', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5', 'Post Date', 'postdate', '2016-07-20 11:18:18', 'a1', '2016-07-20 11:18:20', '', 'active', 0),
('5010072021210808', 'Nama Wakil', 'name_vice', '2021-07-10 21:08:08', 'a1', NULL, NULL, 'active', 0),
('5016042021173740', 'Tipe', 'tipe', '2021-04-16 17:37:40', 'a1', NULL, NULL, 'active', 0),
('5112122018164709', 'Kriteria', 'kriteria', '2018-12-12 16:47:09', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5117112018182854', 'Subject', 'subject', '2018-11-17 18:28:54', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5120012021220435', 'To be', 'tobe', '2021-01-20 22:04:35', 'a1', NULL, NULL, 'active', 0),
('5127102016104952', 'Product Category', 'id_product_category', '2016-10-27 15:49:52', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5211082020202057', 'c', 'c', '2020-08-11 20:20:57', 'a1', NULL, NULL, 'active', 0),
('5211102016060550', 'Position', 'position', '2016-10-11 11:05:50', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5212122018112010', 'Building Area', 'building_area', '2018-12-12 11:20:10', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5225012021221945', 'Author Picture', 'author_picture', '2021-01-25 22:19:45', 'a1', NULL, NULL, 'active', 0),
('53', 'Next', 'next', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('5301112021105811', 'catatan', 'catatan', '2021-11-01 10:58:11', 'a1', NULL, NULL, 'active', 0),
('5321042021164417', 'Nama', 'nama', '2021-04-21 16:44:17', 'a1', NULL, NULL, 'active', 0),
('5409112018192843', 'Category Product', 'cat_product', '2018-11-09 19:28:43', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5411122018205117', 'Image [Bottom]', 'image_bottom', '2018-12-11 20:51:17', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5416112018104557', 'can\'t be empty', 'required', '2018-11-16 10:45:57', 'a1', '2018-11-16 13:53:22', 'a1', 'active', 0),
('5425012021085049', 'Judul', 'judul', '2021-01-25 08:50:49', 'a1', NULL, NULL, 'active', 0),
('5505102016093452', 'No', 'no', '2016-10-05 14:34:52', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5512122018095913', 'Pondation', 'pondation', '2018-12-12 09:59:13', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5527102016111808', 'Back', 'back', '2016-10-27 16:18:08', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5611082018093241', 'Show', 'show', '2018-08-11 14:32:41', '1811102016044913', '0000-00-00 00:00:00', '', 'active', 0),
('5612122018131937', 'Residence Category', 'residence_category', '2018-12-12 13:19:37', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5705102016093346', 'With Link', 'with_link', '2016-10-05 14:33:46', 'a1', '2016-10-05 15:30:26', 'a1', 'active', 0),
('5705102016093608', 'Blank', 'blank', '2016-10-05 14:36:08', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('58', 'Attachment', 'attachment', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('5801112021110044', 'BRI', 'bri', '2021-11-01 11:00:44', 'a1', NULL, NULL, 'active', 0),
('5908122019115404', 'Youtube', 'youtube', '2019-12-08 17:54:04', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5911122018155317', 'Gallery', 'gallery', '2018-12-11 15:53:17', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('5911122018160103', 'Image Other', 'image_other', '2018-12-11 16:01:03', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6', 'Modify By', 'modifyby', '2016-07-20 11:18:41', 'a1', '2016-07-20 11:18:42', '', 'active', 0),
('6005102016093521', 'Link', 'link', '2016-10-05 14:35:21', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6007072021175359', 'Link Youtube', 'link_youtube', '2021-07-07 17:53:59', 'a1', NULL, NULL, 'active', 0),
('6012122018100011', 'Windows Frame', 'windows_frame', '2018-12-12 10:00:11', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('602092020104710', 'Texteditor', 'texteditor', '2020-09-02 10:47:10', 'a1', NULL, NULL, 'active', 0),
('6021042021164524', 'Harga', 'harga', '2021-04-21 16:45:24', 'a1', NULL, NULL, 'active', 0),
('604072020033527', 'Author Information', 'author_info', '2020-07-04 08:35:27', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6111082020201526', 'Setup', 'setup', '2020-08-11 20:15:26', 'a1', NULL, NULL, 'active', 0),
('612122018112040', 'Living Room', 'living_room', '2018-12-12 11:20:40', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('616112018144611', 'Area', 'area', '2018-11-16 14:46:11', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6202082018090724', 'Dibuat Pada', 'created_at', '2018-08-02 14:07:24', 'a1', '2021-07-11 10:36:40', 'a1', 'active', 0),
('625012021221957', 'Author Info', 'author_info', '2021-01-25 22:19:57', 'a1', NULL, NULL, 'active', 0),
('6328102016093818', 'Upload file modul (*.zip)', 'upload_modul', '2016-10-28 14:38:18', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6330082018094225', 'Use Expired', 'use_expired', '2018-08-30 09:42:25', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('64', 'Male', 'male', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('6410112018200356', 'Telp', 'telp', '2018-11-10 20:03:56', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6413122018101156', 'Icon', 'icon', '2018-12-13 10:11:56', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6415022021204149', 'Merk', 'merk', '2021-02-15 20:41:49', 'a1', NULL, NULL, 'active', 0),
('65', 'Female', 'female', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('6605102016103050', 'Target', 'target', '2016-10-05 15:30:50', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6607072021175414', 'Link Line', 'link_line', '2021-07-07 17:54:14', 'a1', NULL, NULL, 'active', 0),
('6608122019115328', 'Department', 'department', '2019-12-08 17:53:28', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6707072021175444', 'Jumlah Department & Biro', 'jumlah_departementbiro', '2021-07-07 17:54:44', 'a1', '2021-07-07 17:55:10', 'a1', 'active', 0),
('6709122019152159', 'Biro', 'biro', '2019-12-09 21:21:59', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('68', 'Sex', 'gender', '2016-07-27 11:38:16', 'a1', '2016-08-11 11:23:10', 'a1', 'active', 0),
('6809112018134839', 'Main', 'main', '2018-11-09 13:48:39', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6815112018165754', 'Title (White)', 'title_white', '2018-11-15 16:57:54', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('6819012021184109', 'Jumlah Mahasiswa', 'jumlah_mahasiswa', '2021-01-19 18:41:09', 'a1', NULL, NULL, 'active', 0),
('6920012021115734', 'Kategori', 'category', '2021-01-20 11:57:34', 'a1', '2021-07-11 10:21:25', 'a1', 'active', 0),
('6925012021085147', 'Tahun Publikasi', 'tahun_jurnal', '2021-01-25 08:51:47', 'a1', '2021-01-25 09:35:17', 'a1', 'active', 0),
('7', 'Modify Date', 'modifydate', '2016-07-20 11:19:01', 'a1', '2016-07-20 11:19:02', '', 'active', 0),
('7014112018165207', 'Other', 'other', '2018-11-14 16:52:07', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7111012019161648', 'First Name', 'first_name', '2019-01-11 16:16:48', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7112122018095753', 'Pondation', 'pondation', '2018-12-12 09:57:53', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7114082018191004', 'Banner', 'banner', '2018-08-14 19:10:04', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('712122018095810', 'Wall', 'wall', '2018-12-12 09:58:10', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7201112021120338', 'Sukses', 'Sukses', '2021-11-01 12:03:38', 'a1', '2021-11-01 12:04:00', 'a1', 'active', 0),
('7207102016062325', 'Logo Website', 'logo_web', '2016-10-07 11:23:25', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('73', 'Phone', 'phone', '2016-07-27 11:38:16', 'a1', '2016-07-27 11:38:17', '', 'active', 0),
('7315082018102104', 'Pertanyaan', 'questions', '2018-08-15 10:21:04', 'a1', '2021-07-11 10:19:23', 'a1', 'active', 0),
('7316082018105956', 'Latitude', 'lat', '2018-08-16 10:59:56', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7402092020101932', 'Textarea', 'textarea', '2020-09-02 10:19:32', 'a1', NULL, NULL, 'active', 0),
('7408102016090750', 'External', 'external', '2016-10-08 14:07:50', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7421012021113233', 'Position Number', 'position_number', '2021-01-21 11:32:33', 'a1', NULL, NULL, 'active', 0),
('7516022021181118', 'Default Table', 'default_table', '2021-02-16 18:11:18', 'a1', NULL, NULL, 'active', 0),
('7601112021105720', 'Metode Pembayaran', 'metode_bayar', '2021-11-01 10:57:20', 'a1', NULL, NULL, 'active', 0),
('7601112021120122', 'status pembayaran', 'status_pembayaran', '2021-11-01 12:01:22', 'a1', NULL, NULL, 'active', 0),
('7613122018105853', 'Promo', 'promo', '2018-12-13 10:58:53', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7627102016115625', 'New Password', 'new_password', '2016-10-27 16:56:25', 'a1', '2016-10-27 17:00:23', 'a1', 'active', 0),
('7627102016124114', 'Direct', 'direct', '2016-10-27 17:41:14', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7704082018053008', 'Record', 'record', '2018-08-04 10:30:08', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7710072021210649', 'Nama Ketua', 'name_chairman', '2021-07-10 21:06:49', 'a1', '2021-07-10 21:10:15', 'a1', 'active', 0),
('7712122018164811', 'Minimum Number Of Participations', 'number_of_participations', '2018-12-12 16:48:11', 'a1', '2018-12-12 16:53:59', 'a1', 'active', 0),
('7715112018165808', 'Title (Yellow)', 'title_yellow', '2018-11-15 16:58:08', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7724072020041421', 'Login Failed', 'login-failed', '2020-07-24 04:14:21', 'a1', '2020-07-25 02:44:36', 'a1', 'active', 0),
('7806102016113634', 'News Category', 'id_news_category', '2016-10-06 16:36:34', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7807102016083850', 'Title Administrator', 'title_cms', '2016-10-07 13:38:50', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7808122019115444', 'Instagram', 'instagram', '2019-12-08 17:54:44', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('7814082018195139', 'Phone Number', 'mobile', '2018-08-14 19:51:39', 'a1', '2018-08-14 19:52:49', 'a1', 'active', 0),
('7827102016115443', 'Old Password', 'old_password', '2016-10-27 16:54:43', 'a1', '2016-10-27 17:00:07', 'a1', 'active', 0),
('7904082018020734', 'Dibuat Oleh', 'created_by', '2018-08-04 07:07:34', 'a1', '2021-07-11 10:35:36', 'a1', 'active', 0),
('7907102016083924', 'Meta Keyword', 'meta_keyword', '2016-10-07 13:39:24', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8012122018094623', 'Floor Plan', 'floor_plan', '2018-12-12 09:46:23', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('807102016084710', 'Text Footer', 'text_footer', '2016-10-07 13:47:10', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8101112021112520', 'rekening', 'rekening', '2021-11-01 11:25:20', 'a1', NULL, NULL, 'active', 0),
('8124102021090025', 'Jurusan', 'jurusan', '2021-10-24 09:00:25', 'a1', '2021-10-24 12:01:59', 'a1', 'active', 0),
('8130062020143836', 'Link Website', 'link_website', '2020-06-30 19:38:36', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8207102016045857', 'Thumbnail', 'thumbnail', '2016-10-07 09:58:57', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8208122019115335', 'Staff', 'staff', '2019-12-08 17:53:35', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8212122018095921', 'Main Door', 'main_door', '2018-12-12 09:59:21', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8212122018100056', 'Kitchen', 'kitchen', '2018-12-12 10:00:56', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8212122018164733', 'Weekdays Price', 'weekdays_price', '2018-12-12 16:47:33', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8220072020133525', 'Acc', 'acc', '2020-07-20 13:35:25', 'a1', NULL, NULL, 'active', 0),
('8221042021164443', 'Nomor HP', 'nomor_hp', '2021-04-21 16:44:43', 'a1', NULL, NULL, 'active', 0),
('8309082018060552', 'Category', 'category', '2018-08-09 11:05:52', '1811102016044913', '0000-00-00 00:00:00', '', 'active', 0),
('8310102016105341', 'Meta Title', 'meta_title', '2016-10-10 15:53:41', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8312122018112051', 'Garage', 'garage', '2018-12-12 11:20:51', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8319082016103830', 'Value', 'value', '2016-08-18 11:44:24', 'a1', '2016-08-19 15:38:41', 'a1', 'active', 0),
('8405102016093444', 'Yes', 'yes', '2016-10-05 14:34:44', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8406102016113005', 'End Date', 'end_date', '2016-10-06 16:30:05', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8407102016045847', 'Gallery Category', 'id_gallery_category', '2016-10-07 09:58:47', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8410072021210326', 'Nama Department / Biro', 'name_dept_biro', '2021-07-10 21:03:26', 'a1', '2021-07-10 21:04:18', 'a1', 'active', 0),
('8412102016050415', 'View', 'view', '2016-10-12 10:04:15', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8412122018095902', 'Roof', 'roof', '2018-12-12 09:59:02', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8413122018133249', 'Latitude', 'lat', '2018-12-13 13:32:49', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8510072021210754', 'Foto Ketua', 'photo_chairman', '2021-07-10 21:07:54', 'a1', NULL, NULL, 'active', 0),
('8516082018110826', 'Fax', 'fax', '2018-08-16 11:08:26', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8516112018143421', 'Institusi', 'institusi', '2018-11-16 14:34:21', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8606072020184300', 'Re Password', 're-password', '2020-07-06 18:43:00', 'a1', NULL, NULL, 'active', 0),
('8612122018095801', 'Floor', 'floor', '2018-12-12 09:58:01', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8612122018112028', 'Bathroom', 'bathroom', '2018-12-12 11:20:28', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8619012021223649', 'Writer', 'writer', '2021-01-19 22:36:49', 'a1', NULL, NULL, 'active', 0),
('8716072021162438', 'Kemahasiswaan', 'kemahasiswaan', '2021-07-16 16:24:38', 'a1', NULL, NULL, 'active', 0),
('8720012021214541', 'As', 'as', '2021-01-20 21:45:41', 'a1', NULL, NULL, 'active', 0),
('8807082018105459', 'Contact', 'contact', '2018-08-07 15:54:59', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('8824102021120433', 'Prestasi', 'prestasi', '2021-10-24 12:04:33', 'a1', NULL, NULL, 'active', 0),
('8916042021173755', 'Gambar', 'gambar', '2021-04-16 17:37:55', 'a1', NULL, NULL, 'active', 0),
('9', 'Password', 'password', '2016-07-20 11:28:19', 'a1', '2016-07-20 11:28:20', '', 'active', 0),
('9007072021200359', 'ID Name', 'id_name', '2021-07-07 20:03:59', 'a1', '2021-07-11 10:15:23', 'a1', 'active', 0),
('9007102016090759', 'Change Password', 'change_password', '2016-10-07 14:07:59', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9010072021210818', 'Foto Wakil', 'photo_vice', '2021-07-10 21:08:18', 'a1', NULL, NULL, 'active', 0),
('9011082020202253', 'Eksternal', 'eksternal', '2020-08-11 20:22:53', 'a1', NULL, NULL, 'active', 0),
('9021072020094149', 'Defaults', 'defaults', '2020-07-21 09:41:49', 'a1', '2020-07-21 12:24:02', 'a1', 'active', 0),
('9024102021090018', 'Angkatan', 'angkatan', '2021-10-24 09:00:18', 'a1', NULL, NULL, 'active', 0),
('9104102016103144', 'Language', 'language', '2016-10-04 15:31:44', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('913122018134115', 'Distance', 'distance', '2018-12-13 13:41:15', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9208102016090729', 'Menu Type', 'menu_type', '2016-10-08 14:07:29', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9212122018100034', 'Instalation', 'instalation', '2018-12-12 10:00:34', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9307102016084217', 'Default Language', 'default_lang', '2016-10-07 13:42:17', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9309112018134832', 'Top', 'top', '2018-11-09 13:48:32', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9310102016102504', 'Management Category', 'id_managementcat', '2016-10-10 15:25:04', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9312122018095959', 'Door Frame', 'door_frame', '2018-12-12 09:59:59', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9312122018110844', 'Floor Plan 1', 'floor_plan1', '2018-12-12 11:08:44', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9315082018155611', 'Parent', 'parent', '2018-08-15 15:56:11', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9408122019115424', 'Facebook', 'facebook', '2019-12-08 17:54:24', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9413082018131055', 'Search Keyword', 'search_keyword', '2018-08-13 13:10:55', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9507102016060212', 'Title Website', 'title_web', '2016-10-07 11:02:12', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9512122018112019', 'Bedroom', 'bedroom', '2018-12-12 11:20:19', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9610102016105437', 'Lead', 'lead', '2016-10-10 15:54:37', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9612122018111959', 'Width', 'width', '2018-12-12 11:19:59', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9719012021184056', 'Jumlah Dosen', 'jumlah_dosen', '2021-01-19 18:40:56', 'a1', NULL, NULL, 'active', 0),
('9807072021175636', 'Jumlah Post Instagram', 'jumlah_postinstagram', '2021-07-07 17:56:36', 'a1', NULL, NULL, 'active', 0),
('9812122018164751', 'Weekend Price', 'weekend_price', '2018-12-12 16:47:51', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9830082018091011', 'Publish Date', 'publish_date', '2018-08-30 09:10:11', 'a1', '2018-08-30 09:10:51', 'a1', 'active', 0),
('9902012019145352', 'Whatsapp Text', 'whatsapp_text', '2019-01-02 14:53:52', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9906102016113018', 'Tags', 'tags', '2016-10-06 16:30:18', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9907102016062235', 'Logo Cms', 'logo_cms', '2016-10-07 11:22:35', 'a1', '0000-00-00 00:00:00', '', 'active', 0),
('9909082018060520', 'Publish', 'publish', '2018-08-09 11:05:20', '1811102016044913', '0000-00-00 00:00:00', '', 'active', 0),
('9925012021222045', 'Author', 'author', '2021-01-25 22:20:45', 'a1', NULL, NULL, 'active', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `build_akun_media_sosial`
--
ALTER TABLE `build_akun_media_sosial`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_akun_pendukung`
--
ALTER TABLE `build_akun_pendukung`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_biro_department`
--
ALTER TABLE `build_biro_department`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_configuration`
--
ALTER TABLE `build_configuration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_data_mahasiswa`
--
ALTER TABLE `build_data_mahasiswa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_data_prestasi`
--
ALTER TABLE `build_data_prestasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_faq`
--
ALTER TABLE `build_faq`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_himpunan_huria_mahasiswa_dan_ukm`
--
ALTER TABLE `build_himpunan_huria_mahasiswa_dan_ukm`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_kategori_dokumentasi`
--
ALTER TABLE `build_kategori_dokumentasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_list_dokumentasi`
--
ALTER TABLE `build_list_dokumentasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_list_donasi`
--
ALTER TABLE `build_list_donasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_list_position`
--
ALTER TABLE `build_list_position`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_list_sosial_media`
--
ALTER TABLE `build_list_sosial_media`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_metode_pembayaran`
--
ALTER TABLE `build_metode_pembayaran`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_page`
--
ALTER TABLE `build_page`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_pimpinan_kabinet`
--
ALTER TABLE `build_pimpinan_kabinet`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_privileges`
--
ALTER TABLE `build_privileges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_privileges_acc`
--
ALTER TABLE `build_privileges_acc`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_privileges_item`
--
ALTER TABLE `build_privileges_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_role`
--
ALTER TABLE `build_role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_role_detail`
--
ALTER TABLE `build_role_detail`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_sosmed_pendukung`
--
ALTER TABLE `build_sosmed_pendukung`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_user`
--
ALTER TABLE `build_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `build_vocab`
--
ALTER TABLE `build_vocab`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `build_data_mahasiswa`
--
ALTER TABLE `build_data_mahasiswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2147483648;

--
-- AUTO_INCREMENT for table `build_list_donasi`
--
ALTER TABLE `build_list_donasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2147483648;

--
-- AUTO_INCREMENT for table `build_metode_pembayaran`
--
ALTER TABLE `build_metode_pembayaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2147483648;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
